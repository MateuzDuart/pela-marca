"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeladasSchema = void 0;
// models/Pelada.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class PeladasSchema extends sequelize_1.Model {
}
exports.PeladasSchema = PeladasSchema;
PeladasSchema.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0,
    },
    payment_day: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 1,
    },
    confirmation_open_hours_before_event: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 24
    },
    confirmation_close_hours_from_event: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 2
    },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    picture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "peladas",
    timestamps: true,
});
