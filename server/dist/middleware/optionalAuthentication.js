"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthentication = optionalAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function optionalAuthentication(req, res, next) {
    const token = req.cookies?.Authorization;
    if (!token) {
        // Não autenticado, mas permitido
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
    }
    catch (err) {
        console.warn("Token inválido ou expirado, ignorando auth");
        // Apenas ignora o token inválido
    }
    next();
}
