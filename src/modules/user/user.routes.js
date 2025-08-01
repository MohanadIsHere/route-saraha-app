import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { resetPasswordValidationSchema } from "../../utils/validation/user.validation.js";

const userRouter = Router();
userRouter.get("/profile", auth, userController.getProfile);
userRouter.get("/verify-email", userController.verifyEmail);
userRouter.put(
  "/resend-confirm-email",
  refreshAuth,
  userController.resendConfirmEmail
);
userRouter.post(
  "/forget-password",
  userController.forgetPassword
);
userRouter.post(
  "/reset-password",
  validation(resetPasswordValidationSchema),
  userController.resetPassword
);
export default userRouter;
