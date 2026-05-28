import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import redisClient from "../redisClient.js";
import { recsCacheKey } from "../utils/recCache.js";

const RECS_LIMIT = 4;
const AVATAR_CAP = 3;
const CACHE_TTL_SECONDS = 600; // 10 minutes
// only use the user's top 3 genres - more than that makes the match too loose
const TOP_GENRES_CONSIDERED = 3;

type Recommendation = {
  book: { id: string; title: string; author: string; coverImage: string };
  reason: string;
  friendAvatars: string[];
};

export const getRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const key = recsCacheKey(userId);

    // cache hit -> return immediately (cheap)
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.status(200).json({
          status: "success",
          data: {
            recommendations: JSON.parse(cached) as Recommendation[],
          },
        });
      }
    } catch (err) {
      // redis hiccup - fall through and recompute
      console.error("Recs cache read failed:", err);
    }

    // step 1 + 2 in parallel - independent queries, no reason to wait sequentially
    const [friendships, mine] = await Promise.all([
      prisma.friendConnection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        select: { requesterId: true, addresseeId: true },
      }),
      // any progress state. bookId excludes from recs, genres feed tier 2
      prisma.userBook.findMany({
        where: { userId },
        select: { bookId: true, book: { select: { genres: true } } },
      }),
    ]);
    const friendIds = friendships.map((c) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId,
    );
    const myBookIds = mine.map((b) => b.bookId);

    // tier 1: "your friends have this"
    // grouped by bookId, ranked by how many friends have it
    const tier1: Recommendation[] = [];
    if (friendIds.length > 0) {
      const grouped = await prisma.userBook.groupBy({
        by: ["bookId"],
        where: {
          userId: { in: friendIds },
          isPrivate: false,
          ...(myBookIds.length > 0 ? { bookId: { notIn: myBookIds } } : {}),
        },
        _count: { userId: true },
        // tiebreaker by bookId for deterministic refresh
        orderBy: [{ _count: { userId: "desc" } }, { bookId: "asc" }],
        take: RECS_LIMIT,
      });

      if (grouped.length > 0) {
        const ids = grouped.map((g) => g.bookId);

        // fetch the actual friend photos + book details in parallel
        const [rows, books] = await Promise.all([
          prisma.userBook.findMany({
            where: {
              bookId: { in: ids },
              userId: { in: friendIds },
              isPrivate: false,
            },
            select: {
              bookId: true,
              user: { select: { photo: true } },
            },
          }),
          prisma.book.findMany({
            where: { id: { in: ids } },
            select: { id: true, title: true, author: true, coverImage: true },
          }),
        ]);

        const bookMap = new Map(books.map((b) => [b.id, b]));
        const avatarsByBook = new Map<string, string[]>();
        for (const r of rows) {
          const arr = avatarsByBook.get(r.bookId) ?? [];
          arr.push(r.user.photo);
          avatarsByBook.set(r.bookId, arr);
        }

        for (const g of grouped) {
          const book = bookMap.get(g.bookId);
          const avatars = avatarsByBook.get(g.bookId) ?? [];
          if (!book) continue;
          tier1.push({
            book,
            reason:
              avatars.length === 1
                ? "1 friend has this"
                : `${avatars.length} friends have this`,
            friendAvatars: avatars.slice(0, AVATAR_CAP),
          });
        }
      }
    }

    // tier 2: "more of what you already read"
    // fills the gap when friends run dry but my shelf still says something
    const remainingAfterTier1 = RECS_LIMIT - tier1.length;
    const tier2: Recommendation[] = [];
    if (remainingAfterTier1 > 0 && mine.length > 0) {
      // tally genres across my shelf
      const genreCounts = new Map<string, number>();
      for (const m of mine) {
        for (const g of m.book.genres) {
          genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
        }
      }

      if (genreCounts.size > 0) {
        // most-read genre first
        const topGenres = Array.from(genreCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, TOP_GENRES_CONSIDERED)
          .map(([genre]) => genre);

        const excludeIds = [...myBookIds, ...tier1.map((r) => r.book.id)];

        const candidates = await prisma.book.findMany({
          where: {
            genres: { hasSome: topGenres },
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            genres: true,
          },
        });

        // most shared genres wins. bookId tiebreaker so refreshes look stable
        const ranked = candidates
          .map((c) => ({
            book: c,
            overlap: c.genres.filter((g) => topGenres.includes(g)).length,
          }))
          .sort((a, b) => {
            if (b.overlap !== a.overlap) return b.overlap - a.overlap;
            return a.book.id.localeCompare(b.book.id);
          })
          .slice(0, remainingAfterTier1);

        for (const r of ranked) {
          // my preference order wins - "Fantasy" beats "Mystery" when both apply
          const reasonGenre =
            topGenres.find((g) => r.book.genres.includes(g)) ?? topGenres[0];
          tier2.push({
            book: {
              id: r.book.id,
              title: r.book.title,
              author: r.book.author,
              coverImage: r.book.coverImage,
            },
            reason: `Because you read ${reasonGenre}`,
            friendAvatars: [],
          });
        }
      }
    }

    // tier 3: popular fallback if tiers 1+2 left slots empty
    const remainingAfterTier2 = RECS_LIMIT - tier1.length - tier2.length;
    const tier3: Recommendation[] = [];
    if (remainingAfterTier2 > 0) {
      const excludeIds = [
        ...myBookIds,
        ...tier1.map((r) => r.book.id),
        ...tier2.map((r) => r.book.id),
      ];
      const grouped = await prisma.userBook.groupBy({
        by: ["bookId"],
        where: {
          // only count public shelf entries - private holders opted out of
          // influencing recs (same rule as tier 1, consistent)
          isPrivate: false,
          ...(excludeIds.length > 0 ? { bookId: { notIn: excludeIds } } : {}),
        },
        _count: { userId: true },
        orderBy: [{ _count: { userId: "desc" } }, { bookId: "asc" }],
        take: remainingAfterTier2,
      });

      if (grouped.length > 0) {
        const ids = grouped.map((g) => g.bookId);
        const books = await prisma.book.findMany({
          where: { id: { in: ids } },
          select: { id: true, title: true, author: true, coverImage: true },
        });
        const bookMap = new Map(books.map((b) => [b.id, b]));
        for (const g of grouped) {
          const book = bookMap.get(g.bookId);
          if (!book) continue;
          tier3.push({
            book,
            reason: "Popular right now",
            friendAvatars: [],
          });
        }
      }
    }

    const recommendations = [...tier1, ...tier2, ...tier3];

    // best-effort cache write
    try {
      await redisClient.set(key, JSON.stringify(recommendations), {
        EX: CACHE_TTL_SECONDS,
      });
    } catch (err) {
      console.error("Recs cache write failed:", err);
    }

    res.status(200).json({
      status: "success",
      data: { recommendations },
    });
  },
);
