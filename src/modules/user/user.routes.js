import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";

const userRouter = Router();
userRouter.get("/profile", auth, userController.getProfile);
userRouter.get("/verify-email", userController.verifyEmail);
userRouter.put("/resend-confirm-email", refreshAuth,userController.resendConfirmEmail);
export default userRouter;
