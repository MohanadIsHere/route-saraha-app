import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";

const userRouter = Router();
userRouter.get("/profile", auth, userController.getProfile);
userRouter.post("/forget-password",userController.forgetPassword)
userRouter.put("/reset-password", userController.resetPassword);

userRouter.put("/resend-confirm-email", refreshAuth,userController.resendConfirmEmail);
export default userRouter;
