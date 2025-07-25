import jwt from "jsonwebtoken";
import User from "../db/models/user.model.js";
export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [pre, token] = authorization.split(" ");
    if (!authorization) {
      return res
        .status(400)
        .json({ message: "token is required in the headers" });
    }
    if (!pre) {
      return res.status(400).json({ message: "Invalid token" });
    }
    let signature = "";
    if (pre == "bearer") {
      signature = "Mohanad23__";
    } else if (pre == "admin") {
      signature = "Mohanad23__**admin";
    } else {
      return res.status(400).json({ message: "Invalid prefix" });
    }
    const payload = jwt.verify(token, signature);
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(400).json({
        message: "token expired , please sign in again to generate a new token",
      });
    }
    return res.status(500).json({ message: error.message, error });
  }
};
