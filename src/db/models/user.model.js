import mongoose from "mongoose";

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
    dob: { type: Date, default: new Date() },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
      trim: true,
      lowercase: true,
    },
    phone : String,
    role : {
      type : String,
      enum : ['user','admin'],
      lowercase : true,
      default : 'user'
    },
    confirmed : {
      type : Boolean,
      default : false
    }
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
