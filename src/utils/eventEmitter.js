import EventEmitter from "node:events";
import { EMAIL } from "../config/env.js";
import sendEmail from "./sendEmail.util.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async ({ to, subject, html }) => {
  return await sendEmail({
    from: EMAIL,
    to,
    subject,
    html,
  });
});
