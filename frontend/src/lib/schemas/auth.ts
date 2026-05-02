import { z } from "zod";

export const SignupSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.email("Enter a valid email").max(255),
    password: z.string().min(8, "At least 8 characters"),
    password_confirm: z.string(),
    photo: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
