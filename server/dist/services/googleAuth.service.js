"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = verifyGoogleToken;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(); // não precisa passar clientId
const allowedClientIds = [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
];
async function verifyGoogleToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: allowedClientIds,
        });
        const payload = ticket.getPayload();
        return payload || null;
    }
    catch (err) {
        console.error("Erro ao verificar token do Google:", err);
        return null;
    }
}
