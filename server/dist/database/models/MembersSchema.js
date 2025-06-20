"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersSchema = void 0;
// models/Member.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../database");
class MembersSchema extends sequelize_1.Model {
}
exports.MembersSchema = MembersSchema;
MembersSchema.init({
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
    },
    role: {
        type: sequelize_1.DataTypes.ENUM("owner", "admin", "member"),
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "members",
});
