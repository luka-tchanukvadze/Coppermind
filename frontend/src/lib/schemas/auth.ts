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

// forgot-password: just an email
export const ForgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// reset-password: new password + confirm
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// settings -> change password: requires current, new, confirm
export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "Passwords don't match",
    path: ["newPasswordConfirm"],
  });
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
