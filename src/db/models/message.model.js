import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: 1,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
