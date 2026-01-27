import nodemailer from "nodemailer";

import "dotenv/config";

export const transporterAssistance = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER_ASSISTENZA,
    pass: process.env.MAIL_PASSWORD_ASSISTENZA,
  },
});

export const transporterOrders = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER_ORDERS,
    pass: process.env.MAIL_PASSWORD_ORDERS,
  },
});

export const transporterGoogle = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "serhiioberemchuk@gmail.com",
    pass: process.env.MAIL_SMTP_GMAIL_PASSWORD,
  },
});
