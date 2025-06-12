import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida no arquivo .env");
}

export const sequelize = new Sequelize(databaseUrl, { logging: false });

export async function initDatabaseConnection() {
    return await sequelize.authenticate();
}


