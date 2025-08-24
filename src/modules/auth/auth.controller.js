import { Router } from "express";
import * as userService from "./auth.service.js";
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
  userService.signup
);
authRouter.post(
  "/sign-in",
  validation(signinValidationSchema),
  userService.signin
);
authRouter.post(
  "/google-sign-in",
  validation(googleAuthValidationSchema),
  userService.googleAuth
);
authRouter.get(
  "/verify-email",
  validation(verifyEmailValidationSchema),
  userService.verifyEmail
);
authRouter.post("/logout", auth, userService.logout);
export default authRouter;
