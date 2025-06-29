"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentActionSchema = void 0;
const zod_1 = require("zod");
exports.paymentActionSchema = zod_1.z.object({
    member_id: zod_1.z.string().uuid(),
    mouth_reference: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Invalid mouth reference format, expected YYYY-MM"),
});
