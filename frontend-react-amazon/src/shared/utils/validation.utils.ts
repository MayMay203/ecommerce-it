import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

export const phoneSchema = z
  .string()
  .regex(/^(0|\+84)[0-9]{9}$/, 'Invalid Vietnamese phone number')
  .optional();

export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name is too long');
