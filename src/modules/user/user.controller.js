import User from "../../db/models/user.model.js";
import sendEmail from "../../utils/sendEmail.util.js";
import { decrypt } from "../../utils/encryption/encryption.js";
import {
  EMAIL,
  ENCRYPTION_KEY,
  JWT_ACCESS_TOKEN_SECRET,
} from "../../config/env.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
export const getProfile = async (req, res, next) => {
  try {
    const phoneNum = decrypt({
      cipherText: req.user.phone,
      secret: ENCRYPTION_KEY,
    });
    req.user.phone = phoneNum;
    return res.status(200).json({
      message: "User retrieved successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      const error = new Error("Token is required");
      error.statusCode = 400;
      throw error;
    }
    const payload = verifyToken({ token, secret: JWT_ACCESS_TOKEN_SECRET });
    const user = await User.findOne({ email: payload.email, confirmed: false });
    if (!user) {
      const error = new Error("User not found or already confirmed");
      error.statusCode = 404;
      throw error;
    }
    user.confirmed = true;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};
export const resendConfirmEmail = async (req, res, next) => {
  try {
    if (req.user.confirmed) {
      return res.status(400).json({ message: "Email already confirmed" });
    }
    const accessToken = generateToken({
      payload: { email: req.user.email },
      secret: JWT_ACCESS_TOKEN_SECRET,
    });
    const link = `http://localhost:3000/users/verify-email?token=${accessToken}`;
    await sendEmail({
      from: `"Saraha App" <${EMAIL}>`,
      to: req.user.email,
      subject: "Verify your email – route-saraha-app",
      text: "Click the link below to verify your email.",
      html: `
  <div style="font-family: system-ui, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
      <h1 style="font-size: 22px; margin-bottom: 16px; color: #111;">Confirm your email</h1>
      <p style="font-size: 15px; color: #555;">Welcome to <b>route-saraha-app</b>. To activate your account, please confirm your email address by clicking the button below.</p>
      <div style="margin: 24px 0;">
        <a href="${link}" style="background-color: #1d72b8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </div>
      <p style="font-size: 13px; color: #888;">If you didn't request this, you can safely ignore it.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">© 2025 route-saraha-app</p>
    </div>
  </div>
  `,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("email not exist");
      error.statusCode = 404;
      throw error;
    }

    const otp = customAlphabet("0123456789", 6);

    await sendEmail({
      from: EMAIL,
      to: EMAIL,
      subject: "forgetPassword",
      html: `<p>opt: ${otp}</p>`,
    });
    return res.status(200).json({
      message: "Otp send successfully , please check your email",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (req,res,next) =>{
  try {
    
  } catch (error) {
    next(error);
    
  }
}