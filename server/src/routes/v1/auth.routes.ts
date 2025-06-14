import { Router } from "express";
import authController from "../../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/auth/google", authController.redirectToGoogle); // NOVO
authRouter.get("/auth/google/callback", authController.handleGoogleCallback); // NOVO

authRouter.post("/auth/google", authController.generateToken); // mantém caso use o fluxo via idToken
authRouter.get("/auth/google/validate", authController.validateToken);

export default authRouter;
