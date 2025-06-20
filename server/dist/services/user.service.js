"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UsersSchema_1 = require("../database/models/UsersSchema");
exports.default = new class UserService {
    async checkIfUserExists(userId) {
        const user = await UsersSchema_1.UsersSchema.findByPk(userId, { attributes: ['id'] });
        return !!user;
    }
};
