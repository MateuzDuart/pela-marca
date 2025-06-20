"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initDatabase;
const initRelations_1 = __importDefault(require("./initRelations"));
const EventConfirmationSchema_1 = require("./models/EventConfirmationSchema");
const EventDaysSchema_1 = require("./models/EventDaysSchema");
const EventsSchema_1 = require("./models/EventsSchema");
const GuestsSchema_1 = require("./models/GuestsSchema");
const MembersSchema_1 = require("./models/MembersSchema");
const PaymentHistoriesSchema_1 = require("./models/PaymentHistoriesSchema");
const PeladaSchema_1 = require("./models/PeladaSchema");
const UsersSchema_1 = require("./models/UsersSchema");
const firstRun = true;
async function initDatabase({ force, alter }) {
    const schemas = [
        EventConfirmationSchema_1.EventConfirmationsSchema,
        EventDaysSchema_1.EventDaysSchema,
        EventsSchema_1.EventsSchema,
        GuestsSchema_1.GuestsSchema,
        MembersSchema_1.MembersSchema,
        PaymentHistoriesSchema_1.PaymentHistoriesSchema,
        PeladaSchema_1.PeladasSchema,
        UsersSchema_1.UsersSchema
    ];
    if (firstRun) {
        await Promise.all(schemas.map(async (schema) => {
            await schema.sync();
        }));
    }
    await (0, initRelations_1.default)();
    await Promise.all(schemas.map(async (schema) => {
        await schema.sync({ force, alter });
    }));
}
