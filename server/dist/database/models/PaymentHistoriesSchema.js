"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHistoriesSchema = void 0;
// models/PaymentHistory.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class PaymentHistoriesSchema extends sequelize_1.Model {
}
exports.PaymentHistoriesSchema = PaymentHistoriesSchema;
PaymentHistoriesSchema.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    reference_month: {
        type: sequelize_1.DataTypes.CHAR(7), // 'YYYY-MM'
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("paid", "pending", "late"),
        allowNull: false,
    },
    confirmed_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    pelada_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "payment_histories",
});
