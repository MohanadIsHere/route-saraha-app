import { Router } from "express";
import * as userService from "./auth.service.js"

const authRouter = Router();

authRouter.post("/sign-up", userService.signup);
authRouter.post("/sign-in", userService.signin);

export default authRouter;
