import { z } from 'zod';

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthLoginSchema = z.infer<typeof authLoginSchema>;

export const authRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3),
});

export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;

export const authResetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8),
});

export type AuthResetSchema = z.infer<typeof authResetSchema>;
