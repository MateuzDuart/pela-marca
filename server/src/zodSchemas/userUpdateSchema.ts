import { z } from "zod";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(30, "Nome muito longo")
    .transform((val) => purify.sanitize(val)),
});

export default updateUserSchema;