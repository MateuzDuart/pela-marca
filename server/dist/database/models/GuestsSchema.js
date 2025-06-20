"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestsSchema = void 0;
// models/Guest.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class GuestsSchema extends sequelize_1.Model {
}
exports.GuestsSchema = GuestsSchema;
GuestsSchema.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    pelada_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "guests",
});
