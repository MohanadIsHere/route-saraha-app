import Message from "../../db/models/message.model.js";
import User, { roles } from "../../db/models/user.model.js";
import cloudinary from "../../utils/cloudinary/cloudinary.js";
      import Report from "../../db/models/report.model.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { content, userId, senderId } = req.body;
    const files = req.files || [];

    if (!content && !files.length) {
      const error = new Error("Content or attachments are required");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User Id not found");
      error.status = 404;
      throw error;
    }

    let sender = null;
    if (senderId) {
      sender = await User.findById(senderId);
      if (!sender) {
        const error = new Error("Sender Id not found");
        error.status = 404;
        throw error;
      }
    }
    if (senderId == userId) {
      const error = new Error("Sender Id cannot be the same as User Id");
      error.status = 400;
      throw error;
    }

    const attachments = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return {
          public_id: result.public_id,
          secure_url: result.secure_url,
          asset_id: result.asset_id,
        };
      })
    );

    const message = await Message.create({
      content,
      userId,
      senderId: senderId || null,
      attachments,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};
export const getMessages = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { userId: req?.user?._id };

    const totalMessages = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "Messages retrieved successfully",
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMessages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      const error = new Error("Message not found");
      error.status = 404;
      throw error;
    }

    // check authorization
    if (
      message.userId.toString() !== req.user._id.toString() &&
      req.user.role !== roles.admin
    ) {
      const error = new Error("You are not authorized to delete this message");
      error.status = 403;
      throw error;
    }

    await message.deleteOne();

    return res.status(200).json({
      message: "Message deleted successfully",
      data: { deletedMessage: message },
    });
  } catch (error) {
    next(error);
  }
};
export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    const { content } = req.body || {};
    const files = req.files || [];

    const message = await Message.findById(id);
    if (!message) {
      const error = new Error("Message not found");
      error.status = 404;
      throw error;
    }

    // check authorization
    if (
      message.userId.toString() !== req.user._id.toString() &&
      req.user.role !== roles.admin
    ) {
      const error = new Error("You are not authorized to update this message");
      error.status = 403;
      throw error;
    }

    let newAttachments = message.attachments;

    if (files.length) {
      await Promise.all(
        message.attachments.map(async (att) => {
          if (att.public_id) {
            await cloudinary.uploader.destroy(att.public_id);
          }
        })
      );

      newAttachments = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            asset_id: result.asset_id,
          };
        })
      );
    }

    message.content = content || message.content;
    message.attachments = newAttachments;

    await message.save();

    return res.status(200).json({
      message: "Message updated successfully",
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const reportMessage = async (req, res, next) => {
  try {
    const { id } = req.params || {}; 
    const { reason } = req.body || {};

    const message = await Message.findById(id);
    if (!message) {
      const error = new Error("Message not found");
      error.status = 404;
      throw error;
    }

    if (message.userId.toString() !== req.user._id.toString()) {
      const error = new Error("You are not authorized to report this message");
      error.status = 403;
      throw error;
    }

    const report = await Report.create({
      messageId: id,
      reportedBy: req.user._id,
      reason,
    });

    return res.status(201).json({
      message: "Message reported successfully",
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};
