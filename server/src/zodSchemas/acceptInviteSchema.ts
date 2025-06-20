import { z } from "zod";

export const acceptInviteSchema = z.object({
  invite_id: z
    .string({
      required_error: "Convite obrigatório",
      invalid_type_error: "Convite inválido"
    })
    .uuid("Convite inválido") // ← aqui valida se é um UUID
});
