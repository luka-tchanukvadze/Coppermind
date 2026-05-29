import { z } from "zod";

// POST /discussions - bookId optional so general threads still work
export const createDiscussionSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(10000),
  // bookId is a Prisma uuid; null = no book attached (existing rows allow null)
  bookId: z.uuid().nullable().optional(),
});

// PATCH /discussions/:id - title + description editable, bookId locked.
// at least one must change or there's nothing to update
export const updateDiscussionSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).max(10000).optional(),
  })
  .refine((d) => d.title !== undefined || d.description !== undefined, {
    message: "At least one field is required",
  });

// POST /discussions/:id/comments - just the content body
export const addCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});
