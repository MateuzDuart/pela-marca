"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
const authRouter = (0, express_1.Router)();
authRouter.get("/auth/google", auth_controller_1.default.redirectToGoogle); // NOVO
authRouter.get("/auth/google/callback", auth_controller_1.default.handleGoogleCallback); // NOVO
authRouter.post("/auth/google", auth_controller_1.default.generateToken); // mantém caso use o fluxo via idToken
authRouter.get("/auth/google/validate", auth_controller_1.default.validateToken);
authRouter.post("/logout", auth_controller_1.default.logout);
exports.default = authRouter;
