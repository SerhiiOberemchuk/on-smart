import nodemailer from "nodemailer";
export const transporterAssistance = nodemailer.createTransport({
  host: "smtps.aruba.it",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_SMTP_USER_ASSISTENZA,
    pass: process.env.MAIL_SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export const transporterGoogle = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "serhiioberemchuk@gmail.com",
    pass: process.env.MAIL_SMTP_GMAIL_PASSWORD, // The 16-character App Password
  },
});
