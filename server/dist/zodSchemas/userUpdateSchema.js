"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const purify_1 = require("../utils/purify");
const updateUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Nome muito curto")
        .max(30, "Nome muito longo")
        .transform((val) => purify_1.purify.sanitize(val)),
});
exports.default = updateUserSchema;
