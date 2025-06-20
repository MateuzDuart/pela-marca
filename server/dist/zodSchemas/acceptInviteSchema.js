"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInviteSchema = void 0;
const zod_1 = require("zod");
exports.acceptInviteSchema = zod_1.z.object({
    invite_id: zod_1.z
        .string({
        required_error: "Convite obrigatório",
        invalid_type_error: "Convite inválido"
    })
        .uuid("Convite inválido") // ← aqui valida se é um UUID
});
