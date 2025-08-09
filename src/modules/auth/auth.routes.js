import { Router } from "express";
import * as userController from "./auth.controller.js";
import {
  googleAuthValidationSchema,
  signinValidationSchema,
  signupValidationSchema,
  verifyEmailValidationSchema,
} from "./auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { onlineFileUpload } from "../../utils/multer/multer.js";
import auth from "../../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post(
  "/sign-up",
  onlineFileUpload({
    acceptedPaths: ["image/jpeg", "image/png", "image/jpg"],
  }).single("image"),
  validation(signupValidationSchema),
  userController.signup
);
authRouter.post(
  "/sign-in",
  validation(signinValidationSchema),
  userController.signin
);
authRouter.post(
  "/google-sign-in",
  validation(googleAuthValidationSchema),
  userController.googleAuth
);
authRouter.get(
  "/verify-email",
  validation(verifyEmailValidationSchema),
  userController.verifyEmail
);
authRouter.post("/logout", auth, userController.logout);
export default authRouter;
