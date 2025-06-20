"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.initDatabaseConnection = initDatabaseConnection;
const sequelize_1 = require("sequelize");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida no arquivo .env");
}
exports.sequelize = new sequelize_1.Sequelize(databaseUrl, { logging: false });
async function initDatabaseConnection() {
    return await exports.sequelize.authenticate();
}
