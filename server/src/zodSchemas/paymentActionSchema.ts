import { z } from 'zod';

export const paymentActionSchema = z.object({
  member_id: z.string().uuid(),
  mouth_reference: z.string().regex(/^\d{4}-\d{2}$/, "Invalid mouth reference format, expected YYYY-MM"),
})