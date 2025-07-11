"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleAuth_service_1 = require("../services/googleAuth.service");
const UsersSchema_1 = require("../database/models/UsersSchema");
const google_auth_library_1 = require("google-auth-library");
const donwloadGoogleImage_1 = require("../utils/donwloadGoogleImage");
if (!process.env.GOOGLE_WEB_CLIENT_ID ||
    !process.env.GOOGLE_WEB_CLIENT_SECRET ||
    !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error("Variáveis de ambiente GOOGLE_WEB_CLIENT_ID, GOOGLE_WEB_CLIENT_SECRET e GOOGLE_REDIRECT_URI precisam ser definidas");
}
const googleClient = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_WEB_CLIENT_ID,
    clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI, // ex: http://localhost:3000/auth/google/callback
});
function generateJWT(userId) {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}
exports.default = new class AuthController {
    // ✅ Rota GET /auth/google
    async redirectToGoogle(_req, res) {
        const url = googleClient.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: ["profile", "email"],
        });
        return res.redirect(url);
    }
    ;
    // ✅ Rota GET /auth/google/callback
    async handleGoogleCallback(req, res) {
        const code = req.query.code;
        if (!code)
            return res.status(400).send("Código ausente");
        try {
            const { tokens } = await googleClient.getToken(code);
            const idToken = tokens.id_token;
            if (!idToken)
                return res.status(400).send("ID Token não retornado");
            const payload = await (0, googleAuth_service_1.verifyGoogleToken)(idToken);
            if (!payload)
                return res.status(401).send("Token inválido");
            let user = await UsersSchema_1.UsersSchema.findOne({ where: { email: payload.email } });
            if (!user) {
                // 🟢 NOVO USUÁRIO → tentativa de baixar foto
                user = await UsersSchema_1.UsersSchema.create({
                    name: payload.name,
                    email: payload.email,
                });
                try {
                    const localImagePath = await (0, donwloadGoogleImage_1.donwloadGoogleImage)(payload.picture);
                    await user.update({ picture: localImagePath });
                }
                catch (e) {
                    console.warn('Falha ao baixar imagem de perfil no cadastro:', e);
                }
            }
            else if (!user.picture) {
                // 🟡 USUÁRIO EXISTENTE → tentar baixar imagem se estiver ausente
                try {
                    const localImagePath = await (0, donwloadGoogleImage_1.donwloadGoogleImage)(payload.picture);
                    await user.update({ picture: localImagePath });
                }
                catch (e) {
                    console.warn('Falha ao baixar imagem de perfil no login:', e);
                }
            }
            const token = generateJWT(user.id);
            return res.redirect(`${process.env.SUCCESS_REDIRECT_URL}?token=${token}`);
        }
        catch (err) {
            console.error("Erro no callback:", err);
            return res.status(500).send("Erro ao autenticar com Google");
        }
    }
    ;
    // POST /auth/google — mantém para quem quiser enviar o idToken manual
    async generateToken(req, res) {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "Token do Google é obrigatório" });
        }
        const googleUser = await (0, googleAuth_service_1.verifyGoogleToken)(idToken);
        if (!googleUser) {
            return res.status(401).json({ message: "Token inválido" });
        }
        try {
            let user = await UsersSchema_1.UsersSchema.findOne({ where: { email: googleUser.email } });
            if (!user) {
                user = await UsersSchema_1.UsersSchema.create({
                    name: googleUser.name,
                    email: googleUser.email,
                    picture: googleUser.picture,
                });
            }
            const token = generateJWT(user.id);
            return res.status(200).json({
                message: "Token gerado com sucesso",
                token,
                user,
            });
        }
        catch (err) {
            console.error("Erro ao gerar token:", err);
            return res.status(500).json({ message: "Erro interno" });
        }
    }
    ;
    async validateToken(req, res) {
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({ message: "Token do Google é obrigatório" });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            res.cookie("Authorization", token, {
                httpOnly: false, // true em produção
                secure: false, // true em produção (HTTPS)
                sameSite: "lax", // "lax" ou "strict" em dev
                domain: process.env.HOST,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
                path: "/",
            });
            res.status(200).redirect(`${process.env.FRONT_END_URL}`);
        }
        catch (err) {
            console.error("Erro ao validar token:", err);
            return res.status(401).json({ message: "Token inválido ou expirado" });
        }
    }
    ;
    async logout(req, res) {
        res.clearCookie("Authorization", {
            httpOnly: false, // true em produção
            secure: false, // true em produção (HTTPS)
            sameSite: "lax", // "lax" ou "strict" em dev
            domain: process.env.HOST,
            maxAge: 1,
            path: "/",
        });
        return res.status(200).json({ message: "Logout realizado com sucesso" });
    }
    ;
};
