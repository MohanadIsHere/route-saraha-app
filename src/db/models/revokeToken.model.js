import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: { type: Date, default : new Date() },
  },
  {
    timestamps: true,
  }
);
const RevokeToken =
  mongoose.models.RevokeToken ||
  mongoose.model("RevokeToken", revokeTokenSchema);
export default RevokeToken;
