import jwt from "jsonwebtoken";
import User from "../../db/models/user.model.js";
import CryptoJS from "crypto-js";
import sendEmail from "../../utils/sendEmail.util.js";
export const getProfile = async (req, res, next) => {
  try {
    const phoneNum = CryptoJS.AES.decrypt(
      req.user.phone,
      "Mohanad23__"
    ).toString(CryptoJS.enc.Utf8);
    req.user.phone = phoneNum;
    return res.status(200).json({
      message: "User retrieved successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }
    const payload = jwt.verify(token, "Mohanad23__");
    const user = await User.findOne({ email: payload.email, confirmed: false });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already confirmed" });
    }
    user.confirmed = true;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(400).json({
        message: "token expired , please sign in again to generate a new token",
      });
    }
    return res.status(500).json({ message: error.message, error });
  }
};
export const resendConfirmEmail = async (req,res,next) => {
  try {
    
    if(req.user.confirmed){
      return res.status(400).json({ message: "Email already confirmed" });
    }
    const accessToken = jwt.sign({ email: req.user.email }, "Mohanad23__");
    const link = `http://localhost:3000/users/verify-email?token=${accessToken}`;
     await sendEmail({
       from: '"Saraha App" <moh2n2dayman@gmail.com>',
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
    return res.status(500).json({ message: error.message, error });
  }
}