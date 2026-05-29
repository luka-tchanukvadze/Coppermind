import { z } from "zod";

// matches backend add/updateCustomDataSchema for the text fields
// (isPrivate is handled outside react-hook-form via the Switch)
export const EntrySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(10000, "Too long"),
});
export type EntryInput = z.infer<typeof EntrySchema>;
