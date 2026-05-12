import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

// one Redis key for the whole public list - simple to invalidate on writes. Fine until I need to scale
const BOOKS_CACHE_KEY = "all_books";

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
    const skip = (page - 1) * limit;

    let books;
    let source: "cache" | "database";

    /* TODO: i need to add a SETNX lock if cache stampede ever becomes a real problem
       (many users simultaneously hitting this route the moment cache expires) */
    const cached = await redisClient.get(BOOKS_CACHE_KEY);
    if (cached) {
      books = JSON.parse(cached);
      source = "cache";
    } else {
      books = await prisma.book.findMany({ orderBy: { title: "asc" } });
      // cache 1 week (604800s)
      await redisClient.set(BOOKS_CACHE_KEY, JSON.stringify(books), {
        EX: 604800,
      });
      source = "database";
    }

    res.status(200).json({
      status: "success",
      source,
      total: books.length,
      page,
      totalPages: Math.ceil(books.length / limit),
      results: Math.min(limit, Math.max(0, books.length - skip)),
      data: { books: books.slice(skip, skip + limit) },
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

// searchBooks: google books proxy. Results aren't in my DB - addUserBook upserts on add
export const searchBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const q = req.query.q as string | undefined;
    if (!q) return next(new AppError("Query parameter 'q' is required", 400));

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    // retry 5xx (google api issue). 4xx = my bug, bail
    let response: globalThis.Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url);
      if (response.ok || response.status < 500) break;
      if (attempt < 2)
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }

    // loop runs at least once but TS doesn't know that, so i need guard
    if (!response) {
      return next(
        new AppError("Search service is temporarily unavailable", 502),
      );
    }

    if (!response.ok) {
      // log full error on the server, send a simple message to the client
      console.error(
        "Google Books API error:",
        response.status,
        await response.text(),
      );
      return next(
        new AppError("Search service is temporarily unavailable", 502),
      );
    }

    const data = (await response.json()) as GoogleBooksResponse;

    // no title = useless. skip
    const books = (data.items || [])
      .filter((item) => item.volumeInfo.title)
      .map((item) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] ?? "Unknown",
        genres: item.volumeInfo.categories ?? [],
        coverImage: item.volumeInfo.imageLinks?.thumbnail ?? "",
        externalApiId: item.id,
      }));

    res.status(200).json({
      status: "success",
      totalItems: books.length,
      data: { books },
    });
  },
);
