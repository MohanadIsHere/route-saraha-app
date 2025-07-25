import User from "../../db/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import sendEmail from "../../utils/sendEmail.util.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "password does not match confirmPassword" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already exist" });
    }
    const hashedPassword = bcrypt.hashSync(password, 12);
    const phoneNum = CryptoJS.AES.encrypt(phone, "Mohanad23__").toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phoneNum,
    });
    const accessToken = jwt.sign({ email }, "Mohanad23__", { expiresIn: "1h" });
    const refreshToken = jwt.sign({ email }, "Mohanad23__#refresh", {
      expiresIn: "1y",
    });
    const link = `http://localhost:3000/users/verify-email?token=${accessToken}`;

    await sendEmail({
      from: '"Saraha App" <moh2n2dayman@gmail.com>',
      to: email,
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


    return res.status(201).json({
      message: "User created successfully, check your email for verification",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message, error });
  }
};
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, confirmed: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "email does not exist or not verified" });
    }
    const compareHashed = bcrypt.compare(password, user.password);
    if (!compareHashed) {
      return res.status(400).json({ message: "Invalid password" });
    }
const accessToken = jwt.sign({ email }, "Mohanad23__", { expiresIn: "1h" });
const refreshToken = jwt.sign({ email }, "Mohanad23__#refresh", {
  expiresIn: "1y",
});    return res.status(200).json({
      message: "User signed in successfully",
      data: {
        accessToken,
        refreshToken
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
