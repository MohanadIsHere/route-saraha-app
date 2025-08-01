import { Router } from "express";
import * as userService from "./auth.controller.js";
import {
  signinValidationSchema,
  signupValidationSchema,
} from "../../utils/validation/auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";

const authRouter = Router();

authRouter.post(
  "/sign-up",
  validation(signupValidationSchema),
  userService.signup
);
authRouter.post(
  "/sign-in",
  validation(signinValidationSchema),
  userService.signin
);

export default authRouter;
