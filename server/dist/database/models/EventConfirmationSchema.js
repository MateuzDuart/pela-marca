"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConfirmationsSchema = void 0;
// models/EventConfirmation.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class EventConfirmationsSchema extends sequelize_1.Model {
}
exports.EventConfirmationsSchema = EventConfirmationsSchema;
EventConfirmationsSchema.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    event_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    member_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "event_confirmations",
});
