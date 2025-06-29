"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsSchema = void 0;
// models/Evento.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class EventsSchema extends sequelize_1.Model {
}
exports.EventsSchema = EventsSchema;
EventsSchema.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    pelada_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("open", "closed", "cancelled"),
        allowNull: false,
        defaultValue: "open",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "events",
});
