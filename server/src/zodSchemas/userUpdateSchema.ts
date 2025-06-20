import { z } from "zod";
import { purify } from "../utils/purify";

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(30, "Nome muito longo")
    .transform((val) => purify.sanitize(val)),
});

export default updateUserSchema;