"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDaysSchema = void 0;
// models/EventDay.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class EventDaysSchema extends sequelize_1.Model {
}
exports.EventDaysSchema = EventDaysSchema;
EventDaysSchema.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    day: {
        type: sequelize_1.DataTypes.ENUM("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"),
        allowNull: false,
    },
    hour: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    pelada_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "event_days",
});
