"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initRelations;
const UsersSchema_1 = require("./models/UsersSchema");
const PeladaSchema_1 = require("./models/PeladaSchema");
const MembersSchema_1 = require("./models/MembersSchema");
const GuestsSchema_1 = require("./models/GuestsSchema");
const EventsSchema_1 = require("./models/EventsSchema");
const PaymentHistoriesSchema_1 = require("./models/PaymentHistoriesSchema");
const EventDaysSchema_1 = require("./models/EventDaysSchema");
const EventConfirmationSchema_1 = require("./models/EventConfirmationSchema");
async function initRelations() {
    // member ralations
    MembersSchema_1.MembersSchema.belongsTo(UsersSchema_1.UsersSchema, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    });
    UsersSchema_1.UsersSchema.hasMany(MembersSchema_1.MembersSchema, {
        foreignKey: "user_id",
        as: "member",
        onDelete: "CASCADE",
    });
    MembersSchema_1.MembersSchema.belongsTo(PeladaSchema_1.PeladasSchema, {
        foreignKey: "pelada_id",
        as: "pelada",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    });
    PeladaSchema_1.PeladasSchema.hasMany(MembersSchema_1.MembersSchema, {
        foreignKey: "pelada_id",
        as: "members",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    // Guest relations
    GuestsSchema_1.GuestsSchema.belongsTo(UsersSchema_1.UsersSchema, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    });
    GuestsSchema_1.GuestsSchema.belongsTo(PeladaSchema_1.PeladasSchema, {
        foreignKey: "pelada_id",
        as: "pelada",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    });
    UsersSchema_1.UsersSchema.hasMany(GuestsSchema_1.GuestsSchema, {
        foreignKey: "user_id",
        as: "guest"
    });
    PeladaSchema_1.PeladasSchema.hasMany(GuestsSchema_1.GuestsSchema, {
        foreignKey: "pelada_id",
        as: "guestCandidates",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    // Event relations
    EventsSchema_1.EventsSchema.belongsTo(PeladaSchema_1.PeladasSchema, {
        foreignKey: "pelada_id",
        as: "pelada",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    });
    PeladaSchema_1.PeladasSchema.hasMany(EventsSchema_1.EventsSchema, {
        foreignKey: "pelada_id",
        as: "events",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    // payment relations
    PaymentHistoriesSchema_1.PaymentHistoriesSchema.belongsTo(UsersSchema_1.UsersSchema, {
        foreignKey: "user_id",
        as: "paymentUser",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    });
    UsersSchema_1.UsersSchema.hasMany(PaymentHistoriesSchema_1.PaymentHistoriesSchema, {
        foreignKey: "user_id",
        as: "paymentHistories",
    });
    PaymentHistoriesSchema_1.PaymentHistoriesSchema.belongsTo(UsersSchema_1.UsersSchema, {
        foreignKey: "confirmed_by",
        as: "confirmedByUser",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    });
    UsersSchema_1.UsersSchema.hasMany(PaymentHistoriesSchema_1.PaymentHistoriesSchema, {
        foreignKey: "confirmed_by",
        as: "confirmedByUser",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    });
    PaymentHistoriesSchema_1.PaymentHistoriesSchema.belongsTo(PeladaSchema_1.PeladasSchema, {
        foreignKey: "pelada_id",
        as: "paymentPelada",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    });
    PeladaSchema_1.PeladasSchema.hasMany(PaymentHistoriesSchema_1.PaymentHistoriesSchema, {
        foreignKey: "pelada_id",
        as: "paymentHistories",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    // Relacionamento: EventDay pertence a uma Pelada
    EventDaysSchema_1.EventDaysSchema.belongsTo(PeladaSchema_1.PeladasSchema, {
        foreignKey: 'pelada_id',
        as: 'pelada',
        onDelete: "CASCADE",
    });
    PeladaSchema_1.PeladasSchema.hasMany(EventDaysSchema_1.EventDaysSchema, {
        foreignKey: "pelada_id",
        as: "schedule",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    // Event Comfirmation Relations
    EventsSchema_1.EventsSchema.hasMany(EventConfirmationSchema_1.EventConfirmationsSchema, {
        foreignKey: "event_id",
        as: "confirmations",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    MembersSchema_1.MembersSchema.hasMany(EventConfirmationSchema_1.EventConfirmationsSchema, {
        foreignKey: "member_id",
        as: "confirmations",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
    EventConfirmationSchema_1.EventConfirmationsSchema.belongsTo(MembersSchema_1.MembersSchema, {
        foreignKey: "member_id",
        as: "member",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
        hooks: true,
    });
}
