import { z } from "zod";

export const updateEventSchema = z.object({
  confirmation_open_hours_before_event: z.number().optional(),
  confirmation_close_hours_from_event: z.number().optional(),
})