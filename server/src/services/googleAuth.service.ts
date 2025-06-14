import { OAuth2Client, TokenPayload } from "google-auth-library";

const client = new OAuth2Client(); // não precisa passar clientId

const allowedClientIds = [
  process.env.GOOGLE_WEB_CLIENT_ID!,
  process.env.GOOGLE_ANDROID_CLIENT_ID!,
];

export async function verifyGoogleToken(idToken: string): Promise<TokenPayload | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: allowedClientIds,
    });

    const payload = ticket.getPayload();
    return payload || null;
  } catch (err) {
    console.error("Erro ao verificar token do Google:", err);
    return null;
  }
}
