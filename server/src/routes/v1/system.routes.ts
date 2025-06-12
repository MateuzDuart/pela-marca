import { Router } from "express";
import systemController from "../../controllers/system.controller"; 

const systemRouter = Router();

systemRouter.get("/", systemController.Home);

export default systemRouter;