import { z } from "zod";

// settings -> profile form (display name, avatar handled separately)
export const UpdateNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});
export type UpdateNameInput = z.infer<typeof UpdateNameSchema>;

// settings -> account form (email change)
export const UpdateEmailSchema = z.object({
  email: z.email("Enter a valid email").max(255),
});
export type UpdateEmailInput = z.infer<typeof UpdateEmailSchema>;
