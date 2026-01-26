"use server";
import nodemailer from "nodemailer";
import { transporterAssistance, transporterGoogle } from "@/lib/mail-transporter";

export async function sendMailAssistance(prevState: { success: boolean }, formData: FormData) {
  try {
    const nome = formData.get("nome");
    const email = formData.get("email");
    const messaggio = formData.get("messaggio");
    const mail = await transporterAssistance.sendMail({
      from: `"Assistenza On-Smart" <${process.env.MAIL_SMTP_USER_ASSISTENZA}>`,
      to: email as string,
      subject: "Nuova richiesta di assistenza da On-Smart",
      text: `Nome: ${nome}\nEmail: ${email}\nMessaggio: ${messaggio}`,
    });
    console.log("Message sent: %s", mail.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mail));

    return {
      mail: { nome, email, messaggio },
      success: true,
      messaggio: "Feedback submitted successfully",
    };
  } catch (error) {
    console.log(error);

    return { success: false, error };
  }
}
