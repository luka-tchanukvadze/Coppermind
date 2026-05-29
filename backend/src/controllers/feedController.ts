import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";

const COMMENT_EXCERPT_MAX = 140;
const FRIENDS_READING_LIMIT = 6;

// cut long text and add "…" so the feed card preview doesn't blow up
function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

export const getFeed = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    // clamp to [1, 50] so a bad client (negative or absurdly large) can't break things
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 30, 50));
    // id of the last item from the previous page (frontend sends it for "load more")
    const cursor = req.query.cursor as string | undefined;

    // step 1: who are my friends?
    // friendship is one row with two sides (requester, addressee). i could be on either
    const friendships = await prisma.friendConnection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    // pick the OTHER person's id - the one who isn't me
    const friendIds = friendships.map((c) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId,
    );

    // no friends = no feed. send empty and stop
    if (friendIds.length === 0) {
      return res.status(200).json({
        status: "success",
        data: { activity: [], friendsReading: [], nextCursor: null },
      });
    }

    // step 2: pull activity stream + friends-reading at the same time
    // Promise.all runs them in parallel so the user waits for the slower one only
    const [activitiesRaw, friendsReadingRaw] = await Promise.all([
      prisma.activity.findMany({
        // collapse the include fan-out into a single SQL query - kills
        // ~10 round-trips to Prisma Cloud per feed page
        relationLoadStrategy: "join",
        where: { userId: { in: friendIds } },
        orderBy: { createdAt: "desc" },
        // ask for one MORE than we need. if we get the extra row back, we know
        // there's another page. if we don't, this is the last page
        take: limit + 1,
        // if the frontend gave a cursor, start AFTER that row
        // skip: 1 because Prisma includes the cursor row itself by default,
        // and we already showed it on the last page
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        // every activity row points to ONE related thing (book/discussion/comment/note),
        // so we pull all four possible relations. the unused ones come back null
        include: {
          user: { select: { id: true, name: true, photo: true } },
          book: {
            select: { id: true, title: true, author: true, coverImage: true },
          },
          discussion: {
            select: {
              id: true,
              title: true,
              description: true,
              // pulled through so feed cards can show what book the thread is about
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  coverImage: true,
                },
              },
              // _count returns { comments: N, likes: N } without loading the rows
              _count: { select: { comments: true, likes: true } },
            },
          },
          comment: {
            select: {
              content: true,
              // hop through the comment to its parent discussion so the feed
              // card can link to it without a second query
              discussion: {
                select: { id: true, title: true, description: true },
              },
            },
          },
          customData: {
            select: {
              id: true,
              title: true,
              content: true,
              // hop note => userBook => book, to know which book the note is about
              userBook: {
                select: {
                  book: {
                    select: {
                      id: true,
                      title: true,
                      author: true,
                      coverImage: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      // "friends reading now" sidebar: one current book per friend (their most recent),
      // public shelves only. distinct collapses duplicates per friend
      prisma.userBook.findMany({
        where: {
          userId: { in: friendIds },
          progress: "READING",
          isPrivate: false,
        },
        orderBy: { progressUpdatedAt: "desc" },
        distinct: ["userId"],
        take: FRIENDS_READING_LIMIT,
        include: {
          user: { select: { id: true, name: true, photo: true } },
          book: {
            select: { id: true, title: true, author: true, coverImage: true },
          },
        },
      }),
    ]);

    // step 3: did we get the +1 extra row? if yes, there's another page
    // chop the extra off before sending, and use the last real row's id as the
    // nextCursor so the frontend can ask for the page after this one
    const hasMore = activitiesRaw.length > limit;
    const page = hasMore ? activitiesRaw.slice(0, limit) : activitiesRaw;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    // step 4: reshape each DB row to match the frontend's FeedItem type
    // - kind is uppercase in the DB enum, lowercase in the frontend type (I'm fixing that)
    // - the four optional relations get unpacked based on what the kind says
    const activity = page.map((a) => {
      const base = {
        id: a.id,
        kind: a.kind.toLowerCase(),
        user: a.user,
        createdAt: a.createdAt,
      };

      switch (a.kind) {
        // shelf activity - the only thing to attach is the book
        case "WANTS_TO_READ":
        case "STARTED_READING":
        case "FINISHED_BOOK":
          return { ...base, book: a.book ?? undefined };

        // new discussion - flatten _count into the flat fields the frontend uses.
        // surface the discussion's book at the top level so the header line reads
        // "X started a discussion on BookTitle by Author"
        case "NEW_DISCUSSION":
          if (!a.discussion) return base;
          return {
            ...base,
            book: a.discussion.book ?? undefined,
            discussion: {
              id: a.discussion.id,
              title: a.discussion.title,
              description: a.discussion.description,
              commentCount: a.discussion._count.comments,
              likeCount: a.discussion._count.likes,
            },
          };

        // comment on a discussion - need the parent discussion's id/title to link,
        // plus a short preview of the comment text
        case "DISCUSSION_COMMENT":
          if (!a.comment) return base;
          return {
            ...base,
            discussion: a.comment.discussion ?? undefined,
            commentExcerpt: truncate(a.comment.content, COMMENT_EXCERPT_MAX),
          };

        // public note about a book - attach the note itself AND the book
        case "PUBLIC_NOTE":
          if (!a.customData) return base;
          return {
            ...base,
            note: {
              id: a.customData.id,
              title: a.customData.title,
              content: a.customData.content,
            },
            book: a.customData.userBook?.book ?? undefined,
          };

        default:
          return base;
      }
    });

    // friends-reading: re-sort by progressUpdatedAt because Postgres DISTINCT ON
    // forces userId as the leading sort, leaving the result in userId order
    // I want freshest-activity-first in the sidebar
    const friendsReading = friendsReadingRaw
      .sort(
        (a, b) =>
          (b.progressUpdatedAt?.getTime() ?? 0) -
          (a.progressUpdatedAt?.getTime() ?? 0),
      )
      .map((ub) => ({ user: ub.user, book: ub.book }));

    res.status(200).json({
      status: "success",
      data: { activity, friendsReading, nextCursor },
    });
  },
);
