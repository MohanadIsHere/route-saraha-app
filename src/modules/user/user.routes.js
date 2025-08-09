import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";
import { onlineFileUpload } from "../../utils/multer/multer.js";

const userRouter = Router();
userRouter.get("/profile", auth, userController.getProfile);
userRouter.put(
  "/profile",
  auth,
  onlineFileUpload({
    acceptedPaths: ["image/jpeg", "image/png", "image/jpg"],
  }).single("image"),
  userController.updateProfile
);
userRouter.post("/forget-password", userController.forgetPassword);
userRouter.put("/reset-password", userController.resetPassword);
userRouter.put(
  "/resend-confirm-email",
  refreshAuth,
  userController.resendConfirmEmail
);
userRouter.delete("/", auth, userController.deleteUser);
export default userRouter;
