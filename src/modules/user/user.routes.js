import { Router } from "express";
import * as userService from "./user.service.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";

const userRouter = Router();
userRouter.get("/profile", auth, userService.getProfile);
userRouter.get("/verify-email", userService.verifyEmail);
userRouter.put("/resend-confirm-email", refreshAuth,userService.resendConfirmEmail);
export default userRouter;
