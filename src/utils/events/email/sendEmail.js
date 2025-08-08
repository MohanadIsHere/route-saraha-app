import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../config/env.js";
import { eventEmitter } from "../eventEmitter.js";

const sendEmail = async ({ from, to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: from || `"Route-Saraha-App" <${EMAIL}>`,
    to: to || "bar@example.com, baz@example.com",
    subject: subject || "Hello ✔",
    text: text || "Hello world?",
    html: html || "<b>Hello world?</b>",
  });

  console.log("Message sent:", info.messageId);
  return info.accepted ? true : false;
};
eventEmitter.on("sendEmail", ({ from, to, subject, text, html }) => {
  sendEmail({ from, to, subject, text, html });
});

export default sendEmail;
