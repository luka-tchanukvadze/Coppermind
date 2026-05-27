import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import redisClient from "../redisClient.js";
import { recsCacheKey } from "../utils/recCache.js";

const RECS_LIMIT = 4;
const AVATAR_CAP = 3;
const CACHE_TTL_SECONDS = 600; // 10 minutes

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

    // step 1: my accepted friends
    const friendships = await prisma.friendConnection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const friendIds = friendships.map((c) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId,
    );

    // step 2: books I already have - excluded from recs (any progress state)
    const mine = await prisma.userBook.findMany({
      where: { userId },
      select: { bookId: true },
    });
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

    // tier 2: popular fallback - only if tier 1 didn't fill all slots
    const remaining = RECS_LIMIT - tier1.length;
    const tier2: Recommendation[] = [];
    if (remaining > 0) {
      const excludeIds = [...myBookIds, ...tier1.map((r) => r.book.id)];
      const grouped = await prisma.userBook.groupBy({
        by: ["bookId"],
        where:
          excludeIds.length > 0 ? { bookId: { notIn: excludeIds } } : {},
        _count: { userId: true },
        orderBy: [{ _count: { userId: "desc" } }, { bookId: "asc" }],
        take: remaining,
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
          tier2.push({
            book,
            reason: "Popular right now",
            friendAvatars: [],
          });
        }
      }
    }

    const recommendations = [...tier1, ...tier2];

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
