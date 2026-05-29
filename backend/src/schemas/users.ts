import { z } from "zod";

// PATCH /users/updateMe - all fields optional, at least one required.
// existing filterObj in the controller already strips other keys; we strip
// again at the schema layer so unknowns never reach the DB
export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z.email().max(255).optional(),
    photo: z.string().max(255).optional(),
  })
  .refine((d) => d.name !== undefined || d.email !== undefined || d.photo !== undefined, {
    message: "At least one field is required",
  });
