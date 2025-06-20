import { Router } from "express";
import systemController from "../../controllers/system.controller"; 
import { authenticate } from "../../middleware/authenticate";
import { uploadImage } from "../../middleware/uploadImage";
import { optionalAuthentication } from "../../middleware/optionalAuthentication";

const systemRouter = Router();

systemRouter.get("/", systemController.home);
systemRouter.get("/user", authenticate, systemController.getUserData);
systemRouter.patch("/user", authenticate, uploadImage.single("image"),  systemController.updateProfile);

// pelada
systemRouter.post("/pelada", authenticate, systemController.createPelada);
systemRouter.get("/my-peladas", authenticate, systemController.getPeladasAsMember);
systemRouter.get("/my-peladas-as-admin", authenticate, systemController.getPeladasAsMember);
systemRouter.patch("/pelada/:id", authenticate, systemController.updatePelada);
systemRouter.post("/send-invite/:id", authenticate, systemController.sendInvite);
systemRouter.get("/invites/:id", authenticate, systemController.getInvites);
systemRouter.post("/accept-invite/:id", authenticate, systemController.acceptInvite);
systemRouter.post("/reject-invite/:id", authenticate, systemController.rejectInvite);
systemRouter.get("/members/:id", systemController.getMembers);
systemRouter.get("/members-as-admin/:id", authenticate, systemController.getMembersAsAdmin);
systemRouter.get("/pelada-as-admin/:id", authenticate, systemController.getPeladaAsAdmin);
systemRouter.get("/invite/:id", optionalAuthentication, systemController.getPeladaInviteData);
systemRouter.delete("/member/:id", authenticate, systemController.deleteMember);
systemRouter.patch("/member-role/:id", authenticate, systemController.setAdminRole);
systemRouter.patch("/remove-member-role/:id", authenticate, systemController.removeAdminRole);


export default systemRouter;