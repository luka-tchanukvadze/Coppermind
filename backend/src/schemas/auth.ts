import { z } from "zod";

// shared email check. NOT lowercased - existing users may have mixed-case
// emails in the DB and normalising would lock them out. case-insensitive
// uniqueness is a future migration (CITEXT or normalize-and-migrate)
const email = z.email().max(255);
// bcrypt only hashes the first 72 bytes; cap input to match
const password = z.string().min(8).max(72);

// signup uses snake_case password_confirm (matches existing controller)
export const signupSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email,
    password,
    password_confirm: z.string(),
    // photo is optional; backend defaults to "default.jpg" when omitted
    photo: z.string().max(255).optional(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export const loginSchema = z.object({
  email,
  // login should NOT reveal the password policy - any non-empty string passes the shape check
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({ email });

// camelCase here (matches resetPassword controller)
export const resetPasswordSchema = z
  .object({
    password,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const updatePasswordSchema = z
  .object({
    // currentPassword can be any string - even if user picked a 4-char password
    // before we tightened the rule, login should still let them change it
    currentPassword: z.string().min(1),
    newPassword: password,
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "Passwords do not match",
    path: ["newPasswordConfirm"],
  });
