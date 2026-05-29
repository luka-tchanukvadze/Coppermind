import { z } from "zod";

// POST /books - admin-only catalog seed. mirrors the books table columns.
// title is @unique in the DB so dupes 409 via the global Prisma error mapping
export const addBookSchema = z.object({
  title: z.string().trim().min(1).max(255),
  author: z.string().trim().min(1).max(255),
  genres: z.array(z.string().max(100)).max(20).default([]),
  coverImage: z.string().max(255).default(""),
  externalApiId: z.string().max(255).nullable().optional(),
});
