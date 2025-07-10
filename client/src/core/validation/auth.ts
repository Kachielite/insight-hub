import { z } from 'zod';

export const authLoginSchema = z.object({
  email: z.string().email().min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export type AuthLoginSchema = z.infer<typeof authLoginSchema>;

export const authRegisterSchema = z.object({
  email: z.string().email().min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(8)
    .min(1, { message: 'Password must be at least 8 characters' }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
});

export const authRequestResetPasswordSchema = z.object({
  email: z.string().email().min(1, { message: 'Email is required' }),
});

export type AuthRequestResetPasswordSchema = z.infer<
  typeof authRequestResetPasswordSchema
>;

export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;

export const authResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    resetToken: z.string().min(1, { message: 'Reset token is required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type AuthResetSchema = z.infer<typeof authResetSchema>;
