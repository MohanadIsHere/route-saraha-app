import User, { genders } from "../../db/models/user.model.js";
import { decryptData, encryptData } from "../../utils/encryption/encryption.js";
import {
  EMAIL,
  ENCRYPTION_KEY,
  JWT_ACCESS_TOKEN_SECRET,
  SALT_ROUNDS,
} from "../../config/env.js";
import { generateToken } from "../../utils/token/token.js";
import { customAlphabet } from "nanoid";
import { hashData } from "../../utils/hashing/hashing.js";
import { eventEmitter } from "../../utils/events/eventEmitter.js";
import cloudinary from "../../utils/cloudinary/cloudinary.js";
export const getProfile = async (req, res, next) => {
  try {
    const phoneNum = decryptData({
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

    eventEmitter.emit("sendEmail", {
      from: `"Route Saraha App" <${EMAIL}>`,
      to: req.user.email,
      subject: "Verify your email – route-saraha-app",
      text: "Click the link below to verify your email.",
      html: `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Check_green_icon.svg/1024px-Check_green_icon.svg.png" alt="Verify" style="width: 60px; height: 60px; margin-bottom: 12px;" />
        <h1 style="font-size: 22px; color: #222; margin: 0;">Confirm your email</h1>
      </div>
      <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
        Thanks for signing up to <b>route-saraha-app</b>. Click the button below to verify your email and activate your account.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${link}" style="background-color: #1d72b8; color: #fff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="font-size: 13px; color: #777; text-align: center;">
        If you didn’t request this email, you can ignore it.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © 2025 route-saraha-app. All rights reserved.
      </p>
    </div>
  </div>
  `,
    });

    return res
      .status(200)
      .json({ message: "Email sent successfully", success: true });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email not exist");
      error.statusCode = 404;
      throw error;
    }

    const generateOtp = customAlphabet("0123456789", 6);
    const otp = generateOtp();

    await User.updateOne(
      { email: user.email },
      { otp, otpExpiresAt: Date.now() + 10 * 60 * 1000 } // ينتهي بعد 10 دقائق
    );

    eventEmitter.emit("sendEmail", {
      from: `"Saraha App" <${EMAIL}>`,
      to: user.email,
      subject: "Password Reset Code – route-saraha-app",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
          <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
            <h1 style="font-size: 22px; color: #222; text-align: center;">Password Reset Code</h1>
            <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
              Use the code below to reset your password. This code will expire in 10 minutes.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="display: inline-block; background-color: #1d72b8; color: white; font-size: 20px; letter-spacing: 4px; padding: 12px 20px; border-radius: 8px; font-weight: bold;">
                ${otp}
              </div>
            </div>
            <p style="font-size: 13px; color: #777; text-align: center;">
              If you didn’t request this, you can ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      message: "OTP sent successfully. Please check your email",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { otp, email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      throw error;
    }
    if (!user.otp) {
      const link = "http://localhost:3000/api/v1/users/forget-password";
      const error = new Error(
        `Please visit ${link} first to generate an otp for you`
      );
      error.statusCode = 400;
      throw error;
    }
    if (user.otp !== otp) {
      const error = new Error("Wrong otp, please try again later");
      error.statusCode = 400;
      throw error;
    }
    const hashed = await hashData({
      plainText: newPassword,
      saltRounds: SALT_ROUNDS,
    });
    await User.updateOne(
      { email: user.email },
      { $unset: { otp: "" }, password: hashed }
    );

    eventEmitter.emit("sendEmail", {
      from: `"Saraha App" <${EMAIL}>`,
      to: user.email,
      subject: "Password Updated – route-saraha-app",
      html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
      <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Green_check_icon_with_gradient.svg/1024px-Green_check_icon_with_gradient.svg.png" alt="Success" style="width: 60px; height: 60px;" />
        </div>
        <h1 style="font-size: 22px; color: #222; text-align: center; margin-bottom: 16px;">
          Your password has been updated
        </h1>
        <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
          This is a confirmation that your password for <b>route-saraha-app</b> has been changed successfully.
        </p>
        <p style="font-size: 13px; color: #777; text-align: center;">
          If you did not make this change, please <a href="http://localhost:3000/users/forget-password" style="color: #1d72b8; text-decoration: none;">reset your password</a> immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © 2025 route-saraha-app. All rights reserved.
        </p>
      </div>
    </div>
  `,
    });

    return res
      .status(200)
      .json({ message: "password updated successfully", success: true });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, dob, gender, phone } = req.body || {};

    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    if (!name && !dob && !gender && !phone && !req?.file) {
      const error = new Error("No data provided to update");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      throw error;
    }

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (gender && Object.values(genders).includes(gender)) {
      user.gender = gender;
    }
    if (phone) {
      const encryptedPhone = encryptData({
        plainText: phone,
        secret: ENCRYPTION_KEY,
      });
      user.phone = encryptedPhone;
    }

    if (req?.file) {
      if (user?.profilePicture?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.profilePicture.public_id);
        } catch (error) {
          next(error);
        }
      }

      const { secure_url, public_id, display_name } =
        await cloudinary.uploader.upload(req.file.path, {
          folder: `route-saraha-app/users/${email}`,
          filename_override: `${user?.name || email} profile picture`,
          use_filename: true,
          public_id: `${user?.email} profile picture`,
          overwrite: true,
        });

      user.profilePicture = { secure_url, public_id, display_name };
    }

    await user.save();

    const firstName =
      user?.name && typeof user.name === "string"
        ? user.name.trim().split(/\s+/)[0]
        : "User";

    eventEmitter.emit("sendEmail", {
      from: `"Saraha App" <${EMAIL}>`,
      to: user.email,
      subject: "Profile Updated",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="color: #4CAF50;">Hello ${firstName} 👋!</h2>
          <p>Your profile information has been updated successfully.</p>
          <p>If you did not make this change, please <a href="http://localhost:3000/support">contact support</a> immediately.</p>
          <br>
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    if(req?.user?.confirmed === false) {
      const error = new Error("Account must be confirmed to do this action");
      error.statusCode = 400;
      throw error;
    }
    await cloudinary.uploader
      .destroy(req?.user?.profilePicture?.public_id)
      .catch((error) => next(error));

    const userEmail = req.user.email;
    const userName = req.user.name || "User";

    await User.deleteOne({ email: userEmail });
    

    eventEmitter.emit("sendEmail", {
      from: EMAIL,
      to: userEmail,
      subject: "Account Deleted",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hello ${userName.split(" ")[0] || "User"} 👋 !</h2>
          <p>Your account has been deleted successfully.</p>
          <p>If you did not request this, please contact support immediately.</p>
          <br>
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
