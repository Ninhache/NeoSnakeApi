import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Min 4 chars" })
    .max(16, { message: "Max 16 chars" }),
  password: z.string().min(4, { message: "Minimum of 4 length" }),
});

export const loginSchema = z.object({
  username: z.string().refine((v) => v.length > 0, {
    message: "Username is required",
  }),
  password: z.string().refine((v) => v.length > 0, {
    message: "Password is required",
  }),
});
