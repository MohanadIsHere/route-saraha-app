import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: 1,
    },
    attachments: {
      type: [
        {
          public_id: String,
          secure_url: String,
          asset_id: String,
        },
      ],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
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
