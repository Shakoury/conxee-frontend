import { z } from 'zod';
export const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address.')
  .max(254, 'Email is too long.');
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Use no more than 128 characters.');
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});
export const facultySchema = z.object({
  faculty: z
    .string()
    .trim()
    .min(2, 'Enter your faculty.')
    .max(120, 'Use no more than 120 characters.'),
  department: z
    .string()
    .trim()
    .min(2, 'Enter your department.')
    .max(120, 'Use no more than 120 characters.'),
});
export const detailsSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, 'Enter your display name.')
      .max(80, 'Use no more than 80 characters.'),
    username: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(30, 'Use no more than 30 characters.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers and underscores only.'),
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Confirm your password.'),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match.',
  });
export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email.'),
});
export const studentSchema = z.object({
  student_id: z.string().trim().max(64, 'Use no more than 64 characters.'),
});
export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Confirm your password.'),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match.',
  });
export type Details = z.infer<typeof detailsSchema>;
