import { Role } from "./backend/generated/prisma/index.js";

// Define a custom interface for the User object
export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  password?: string;
  role: Role;
  passwordChangedAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  active?: boolean;
}

// Define a custom interface for the Decoded JWT Token
export interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
}

// Extend the Express Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
