"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePeladaSchema = void 0;
const zod_1 = require("zod");
const purify_1 = require("../utils/purify");
const isValidTime_1 = require("../utils/isValidTime");
const daySchema = zod_1.z.object({
    hour: zod_1.z.string({
        required_error: "Horário é obrigatório",
    }).refine(isValidTime_1.isValidTime, {
        message: "Horário inválido. Use o formato HH:MM",
    }),
    is_active: zod_1.z.boolean().optional()
}, {
    invalid_type_error: "Tipo de agendamento inválido",
});
exports.updatePeladaSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        invalid_type_error: "Nome deve ser um texto"
    })
        .trim()
        .min(2, "Nome muito curto")
        .max(30, "Nome muito longo")
        .transform((val) => purify_1.purify.sanitize(val))
        .optional(),
    price: zod_1.z
        .number({
        required_error: "Preço obrigatório",
        invalid_type_error: "Preço inválido"
    })
        .min(0, "Preço inválido")
        .max(1000, "Preço inválido")
        .optional(),
    payment_day: zod_1.z
        .number({
        required_error: "Dia obrigatório",
        invalid_type_error: "Dia inválido"
    })
        .min(1, "Dia inválido")
        .max(31, "Dia inválido").optional(),
    schedule: zod_1.z.object({
        sunday: daySchema.optional(),
        monday: daySchema.optional(),
        tuesday: daySchema.optional(),
        wednesday: daySchema.optional(),
        thursday: daySchema.optional(),
        friday: daySchema.optional(),
        saturday: daySchema.optional(),
    }).optional(),
    confirmation_open_hours_before_event: zod_1.z.number({
        invalid_type_error: "A hora de abertura de confirmação deve ser númerica",
    })
        .min(1, "A hora de abertura de confirmação deve ser maior que 0")
        .max(10000, "A hora de abertura de confirmação deve ser menor ou igual a 10.000")
        .optional(),
    confirmation_close_hours_from_event: zod_1.z.number({
        invalid_type_error: "A hora de fechamento de confirmação deve ser númerica",
    })
        .min(-10000, "A hora de fechamento de confirmação deve ser maior que -10.000")
        .max(10000, "A hora de fechamento de confirmação deve ser menor ou igual a 10.000")
        .optional(),
});
