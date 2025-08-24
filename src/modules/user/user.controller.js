import { Router } from "express";
import * as userService from "./user.service.js";
import auth from "../../middlewares/auth.middleware.js";
import { refreshAuth } from "../../middlewares/refreshAuth.middleware.js";
import { onlineFileUpload } from "../../utils/multer/multer.js";

const userRouter = Router();
userRouter.get("/profile", auth, userService.getProfile);
userRouter.put(
  "/profile",
  auth,
  onlineFileUpload({
    acceptedPaths: ["image/jpeg", "image/png", "image/jpg"],
  }).single("image"),
  userService.updateProfile
);
userRouter.post("/forget-password", userService.forgetPassword);
userRouter.put("/reset-password", userService.resetPassword);
userRouter.put(
  "/resend-confirm-email",
  refreshAuth,
  userService.resendConfirmEmail
);
userRouter.delete("/", auth, userService.deleteUser);
export default userRouter;
