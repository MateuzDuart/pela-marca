import { Router } from "express";
import authController from "../../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/auth/google", authController.googleAuth);

export default authRouter;