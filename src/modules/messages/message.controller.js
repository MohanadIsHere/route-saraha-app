import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  deleteMessageValidationSchema,
  reportMessageValidationSchema,
  sendMessageValidationSchema,
  updateMessageValidationSchema,
} from "./message.validation.js";
import * as messageService from "./message.service.js";
import { onlineFileUpload } from "../../utils/multer/multer.js";
import auth from "../../middlewares/auth.middleware.js";

const messageRouter = Router();

messageRouter.post(
  "/send",

  onlineFileUpload({
    acceptedPaths: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4",
    ],
  }).array("attachments", 5),
  validation(sendMessageValidationSchema),
  messageService.sendMessage
);
messageRouter.get("/", auth, messageService.getMessages);
messageRouter.delete(
  "/:id",
  auth,
  validation(deleteMessageValidationSchema),
  messageService.deleteMessages
);
messageRouter.patch(
  "/:id",
  auth,
  onlineFileUpload().array("attachments", 5),
  validation(updateMessageValidationSchema),
  messageService.updateMessage
);
messageRouter.post(
  "/report/:id",
  auth,
  validation(reportMessageValidationSchema),
  messageService.reportMessage
);

export default messageRouter;
