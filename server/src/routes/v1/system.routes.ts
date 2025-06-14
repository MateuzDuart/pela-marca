import { Router } from "express";
import systemController from "../../controllers/system.controller"; 
import { authenticate } from "../../middleware/authenticate";
import { uploadImage } from "../../middleware/uploadImage";

const systemRouter = Router();

systemRouter.get("/", systemController.home);
systemRouter.get("/user", authenticate, systemController.getUserData);
systemRouter.patch("/user", authenticate, uploadImage.single("image"),  systemController.updateProfile);


export default systemRouter;