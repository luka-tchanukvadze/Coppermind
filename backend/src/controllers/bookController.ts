import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

import { searchGoogleBooks } from "../services/googleBooks.js";
import { searchOpenLibrary } from "../services/openLibrary.js";
import type { BookSearchResult } from "../services/types.js";

// one Redis key for the whole public list. cheap to invalidate on writes
const BOOKS_CACHE_KEY = "all_books";
// lock so only one request rebuilds the cache at a time
const BOOKS_LOCK_KEY = "all_books:lock";
const BOOKS_CACHE_TTL = 60 * 60 * 24; // 1 day - safety net in case invalidation ever misses a write
// auto-frees the lock if the rebuilder crashed before deleting it
const BOOKS_LOCK_TTL = 10;
const STAMPEDE_WAIT_MS = 100;
const STAMPEDE_MAX_WAITS = 10; // ~1s total

type CachedBooks = Awaited<ReturnType<typeof prisma.book.findMany>>;

// cache-or-fetch the full catalog. used by list, genre filter, and genre tally
async function loadCatalog() {
  const cached = await redisClient.get(BOOKS_CACHE_KEY);
  if (cached) {
    return { books: JSON.parse(cached) as CachedBooks, source: "cache" as const };
  }

  // NX = set only if missing. first request through wins the rebuild,
  // everyone else falls through to the poll loop below
  const gotLock = await redisClient.set(BOOKS_LOCK_KEY, "1", {
    NX: true,
    EX: BOOKS_LOCK_TTL,
  });

  if (gotLock) {
    try {
      const books = await prisma.book.findMany({ orderBy: { title: "asc" } });
      await redisClient.set(BOOKS_CACHE_KEY, JSON.stringify(books), {
        EX: BOOKS_CACHE_TTL,
      });
      return { books, source: "database" as const };
    } finally {
      // release even on error - otherwise next request waits the safety TTL
      await redisClient.del(BOOKS_LOCK_KEY);
    }
  }

  // someone else is rebuilding. wait for the cache to fill, up to ~1s
  for (let i = 0; i < STAMPEDE_MAX_WAITS; i++) {
    await new Promise((r) => setTimeout(r, STAMPEDE_WAIT_MS));
    const retry = await redisClient.get(BOOKS_CACHE_KEY);
    if (retry) {
      return { books: JSON.parse(retry) as CachedBooks, source: "cache" as const };
    }
  }

  // rebuilder slow or stuck. query directly so this request doesn't hang.
  // skip the cache write - the rebuilder will do it
  const books = await prisma.book.findMany({ orderBy: { title: "asc" } });
  return { books, source: "database" as const };
}

// addBook: admin-only. Seeds new entries into the global catalog.
export const addBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, author, genres, coverImage, externalApiId } = req.body;

    const data = await prisma.book.create({
      data: { title, author, genres, coverImage, externalApiId },
    });

    // Invalidate cache - the list is now stale
    await redisClient.del(BOOKS_CACHE_KEY);

    res.status(201).json({
      status: "success",
      data: { book: data },
    });
  },
);

export const getAllBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // clamp inputs so a bad ?page=-5 or ?limit=99999 can't blow up the response
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const genre = (req.query.genre as string | undefined)?.trim();
    const skip = (page - 1) * limit;

    const { books: all, source } = await loadCatalog();
    // genre filter is applied in JS off the cached list - cheap at our scale,
    // and means the cache stays a single full snapshot (no per-genre keys)
    const filtered = genre
      ? all.filter((b) => b.genres.includes(genre))
      : all;

    res.status(200).json({
      status: "success",
      source,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
      results: Math.min(limit, Math.max(0, filtered.length - skip)),
      data: { books: filtered.slice(skip, skip + limit) },
    });
  },
);

// genre tags + counts for the chip row on /books. total is the unique book
// count (NOT the sum of per-genre counts - books often have multiple genres)
export const getGenres = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { books } = await loadCatalog();
    const counts = new Map<string, number>();
    for (const b of books) {
      for (const g of b.genres) {
        counts.set(g, (counts.get(g) ?? 0) + 1);
      }
    }
    const genres = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count }));

    res.status(200).json({
      status: "success",
      data: { total: books.length, genres },
    });
  },
);

// getBook: single book lookup by id. Pattern mirrors getUserBook in userBookController.ts
// minus the ownership check, since books are global, not user-scoped
export const getBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) return next(new AppError("No book found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: { book },
    });
  },
);

// readers tab on the book detail page. only public shelves count, since a private
// shelf entry means the user opted out of being shown here
export const getBookReaders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const rows = await prisma.userBook.findMany({
      where: { bookId: id, isPrivate: false },
      select: {
        progress: true,
        user: { select: { id: true, name: true, photo: true } },
      },
      orderBy: { progressUpdatedAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: rows.length,
      data: { readers: rows },
    });
  },
);

// public notes tab on the book detail page. only non-private notes, joined
// through userBook so we can scope to this specific book
export const getBookPublicNotes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const notes = await prisma.customData.findMany({
      where: { isPrivate: false, userBook: { bookId: id } },
      include: { user: { select: { id: true, name: true, photo: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: notes.length,
      data: { notes },
    });
  },
);

// related-discussions tab on the book detail page. mirrors getDiscussions
// shape (creator + counts) but filtered to this book's bookId
export const getBookDiscussions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const discussions = await prisma.discussion.findMany({
      where: { bookId: id },
      include: {
        creator: { select: { id: true, name: true, photo: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: discussions.length,
      data: { discussions },
    });
  },
);

// searchBooks: google primary, OL fallback. Results aren't in my DB - addUserBook upserts on add
export const searchBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const q = req.query.q as string | undefined;
    if (!q) return next(new AppError("Query parameter 'q' is required", 400));

    let books: BookSearchResult[];
    let source: "google" | "openlibrary";

    try {
      books = await searchGoogleBooks(q);
      source = "google";
    } catch (err) {
      console.error(
        "Google search failed, falling back to OpenLibrary:",
        err instanceof Error ? err.message : err,
      );
      try {
        books = await searchOpenLibrary(q);
        source = "openlibrary";
      } catch (olErr) {
        console.error(
          "OpenLibrary search also failed:",
          olErr instanceof Error ? olErr.message : olErr,
        );
        return next(
          new AppError("Search service is temporarily unavailable", 502),
        );
      }
    }

    res.status(200).json({
      status: "success",
      source,
      totalItems: books.length,
      data: { books },
    });
  },
);
