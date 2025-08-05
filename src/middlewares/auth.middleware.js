import jwt from "jsonwebtoken";
import User from "../db/models/user.model.js";
import { ENCRYPTION_KEY, ENCRYPTION_KEY_ADMIN } from "../config/env.js";
import { verifyToken } from "../utils/token/token.js";
export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [pre, token] = authorization.split(" ");
    if (!authorization) {
      const error = new Error("Authorization header is required");
      error.status = 401;
      return next(error);
    }
    if (!pre) {
      const error = new Error("Invalid token");
      error.status = 400;
      return next(error);
    }
    let signature = "";
    if (pre == "bearer") {
      signature = ENCRYPTION_KEY;
    } else if (pre == "admin") {
      signature = ENCRYPTION_KEY_ADMIN;
    } else {
      const error = new Error("Invalid prefix");
      error.status = 400;
      return next(error);
    }
    const payload = verifyToken({ token, secret: signature });
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
    return res.status(500).json({ message: error.message, error });
  }
};
