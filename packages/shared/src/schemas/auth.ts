import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Shape of a user as exposed to clients — never includes the password hash. */
export const userPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  provider: z.enum(["local", "google"]),
  avatarUrl: z.string().url().nullish(),
});

/** Standard success body for register / login / me. */
export const authResponseSchema = z.object({
  user: userPublicSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
