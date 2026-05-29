import { z } from "zod";

// matches the Progress enum in schema.prisma
const progress = z.enum(["WANT_TO_READ", "READING", "READ"]);

// POST /user-books - first time shelving a book. fields mirror BookSearchResult
// plus user choices (progress + isPrivate). cover/title constraints match
// the VARCHAR(255) columns on the books table so we 400 before Prisma 500s
export const addUserBookSchema = z.object({
  title: z.string().trim().min(1).max(255),
  author: z.string().trim().min(1).max(255),
  // frontend often passes [] for catalog rec adds; allow empty
  genres: z.array(z.string().max(100)).max(20).default([]),
  // covers come from Google Books URLs - capped to match the DB column
  coverImage: z.string().max(255).default(""),
  // optional in the DB; some search results don't have it
  externalApiId: z.string().max(255).nullable().optional(),
  progress,
  isPrivate: z.boolean().optional(),
});

// PATCH /user-books/:id - both fields optional, but at least one must be set
// or there's nothing to update
export const updateUserBookSchema = z
  .object({
    progress: progress.optional(),
    isPrivate: z.boolean().optional(),
  })
  .refine((d) => d.progress !== undefined || d.isPrivate !== undefined, {
    message: "At least one field is required",
  });

// POST /user-books/:id/custom-data - title/content for a note
export const addCustomDataSchema = z.object({
  title: z.string().trim().min(1).max(255),
  // content has no max in the DB. cap to a reasonable size to prevent abuse
  content: z.string().min(1).max(10000),
  isPrivate: z.boolean().optional(),
});

// PATCH /user-books/:id/custom-data/:dataId - all optional, at least one required
export const updateCustomDataSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    content: z.string().min(1).max(10000).optional(),
    isPrivate: z.boolean().optional(),
  })
  .refine(
    (d) => d.title !== undefined || d.content !== undefined || d.isPrivate !== undefined,
    { message: "At least one field is required" },
  );
