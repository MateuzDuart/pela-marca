import { z } from "zod";

export const getMemberSchema = z.object({
  member_id: z
    .string({
      required_error: "Membro obrigatório",
      invalid_type_error: "Membro inválido"
    })
    .uuid("Membro inválido"),
});