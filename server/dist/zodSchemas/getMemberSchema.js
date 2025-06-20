"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberSchema = void 0;
const zod_1 = require("zod");
exports.getMemberSchema = zod_1.z.object({
    member_id: zod_1.z
        .string({
        required_error: "Membro obrigatório",
        invalid_type_error: "Membro inválido"
    })
        .uuid("Membro inválido"),
});
