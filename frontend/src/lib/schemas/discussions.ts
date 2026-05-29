import { z } from "zod";

// matches backend createDiscussionSchema for the text fields
// (bookId is handled outside react-hook-form via the BookPicker)
export const NewDiscussionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(10000, "Too long"),
});
export type NewDiscussionInput = z.infer<typeof NewDiscussionSchema>;

// edit uses the same shape as new - both fields are still required
export const EditDiscussionSchema = NewDiscussionSchema;
export type EditDiscussionInput = z.infer<typeof EditDiscussionSchema>;

// matches backend addCommentSchema
export const AddCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Reply can't be empty")
    .max(5000, "Too long"),
});
export type AddCommentInput = z.infer<typeof AddCommentSchema>;
