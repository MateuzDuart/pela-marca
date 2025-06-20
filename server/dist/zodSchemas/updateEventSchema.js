"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = void 0;
const zod_1 = require("zod");
exports.updateEventSchema = zod_1.z.object({
    confirmation_open_hours_before_event: zod_1.z.number().optional(),
    confirmation_close_hours_from_event: zod_1.z.number().optional(),
});
