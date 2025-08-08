import mongoose from "mongoose";

export const genders = {
  male: "male",
  female: "female",
};

export const roles = {
  user: "user",
  admin: "admin",
};

export const providers = {
  system: "system",
  google: "google",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 50,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 5,
    },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: Object.values(genders),
      default: genders.male,
      trim: true,
      lowercase: true,
    },
    phone: String,
    role: {
      type: String,
      enum: Object.values(roles),
      lowercase: true,
      default: roles.user,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    provider: {
      lowercase: true,
      type: String,
      enum: {
        values: Object.values(providers),

        message: "{VALUE} is not supported",
      },
      default: providers.system,
    },
    profilePicture: {
      public_id: {
        type: String,
        required: true
      },
      secure_url: {
        type: String,
        required: true
      },
      display_name: {
        type: String,
        required: true
      },
    }
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
