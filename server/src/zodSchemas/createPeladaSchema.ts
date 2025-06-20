import { z } from "zod";
import { purify } from "../utils/purify";
import { isValidTime } from "../utils/isValidTime";

const daySchema = z.object({
  hour: z.string({
    required_error: "Horário é obrigatório",
  }).refine(isValidTime, {
    message: "Horário inválido. Use o formato HH:MM",
  }),
  is_active: z.boolean().optional()
}, {
  invalid_type_error: "Tipo de agendamento inválido",
});

export const createPeladaSchema = z.object({
  name: z
    .string({
      required_error: "Nome obrigatório",
      invalid_type_error: "Nome deve ser um texto"
    })
    .trim()
    .min(2, "Nome muito curto")
    .max(30, "Nome muito longo")
    .transform((val) => purify.sanitize(val)),

  price: z
    .number({
      required_error: "Preço obrigatório",
      invalid_type_error: "Preço inválido"
    })
    .min(0, "Preço inválido")
    .max(1000, "Preço inválido")
    .optional(),

  payment_day: z
    .number({
      required_error: "Dia obrigatório",
      invalid_type_error: "Dia inválido"
    })
    .min(1, "Dia inválido")
    .max(31, "Dia inválido").optional(),

  schedule: z.object({
    sunday: daySchema.optional(),
    monday: daySchema.optional(),
    tuesday: daySchema.optional(),
    wednesday: daySchema.optional(),
    thursday: daySchema.optional(),
    friday: daySchema.optional(),
    saturday: daySchema.optional(),
  }, {
    required_error: "É obrigatório informar o agendamento",
  })
});
