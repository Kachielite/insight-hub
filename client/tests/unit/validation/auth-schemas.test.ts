import { z } from 'zod';

// These schemas should match your actual validation schemas
// Update the import paths based on your actual schema location
describe('Authentication Validation Schemas', () => {
  // Mock schemas - replace with your actual schemas
  const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const resetPasswordRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
  });

  const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  });

  describe('Login Schema Validation', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 6 characters'
        );
      }
    });

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
        // missing password
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Register Schema Validation', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Name must be at least 2 characters'
        );
      }
    });

    it('should reject invalid email in registration', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Reset Password Request Schema', () => {
    it('should validate correct reset request data', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = resetPasswordRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in reset request', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = resetPasswordRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Reset Password Schema', () => {
    it('should validate correct reset password data', () => {
      const validData = {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const invalidData = {
        token: '',
        newPassword: 'newpassword123',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short new password', () => {
      const invalidData = {
        token: 'valid-token',
        newPassword: '123',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
