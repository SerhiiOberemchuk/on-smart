"use server";

import { transporterOrders } from "@/lib/mail-transporter";

export async function sendMailOrders(prevState: { success: boolean }, formData: FormData) {
  try {
    const nome = String(formData.get("nome") ?? "");
    const email = String(formData.get("email") ?? "");
    const messaggio = String(formData.get("messaggio") ?? "");

    await transporterOrders.sendMail({
      from: `"Ordini On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: process.env.MAIL_USER_ORDERS,
      replyTo: email,
      subject: "Nuova richiesta di assistenza da On-Smart",
      text: `Nome: ${nome}\nEmail: ${email}\nMessaggio:\n${messaggio}`,
    });

    await transporterOrders.sendMail({
      from: `"Ordini On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: email,
      subject: "Abbiamo ricevuto la tua richiesta – On-Smart",
      text: `Ciao ${nome}, abbiamo ricevuto la tua richiesta di assistenza.
      Messaggio inviato: "${messaggio}"
      Il nostro team ti risponderà il prima possibile.
      — On-Smart Support`,
    });

    return {
      success: true,
      messaggio: "Richiesta inviata con successo",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      messaggio: "Errore durante l'invio della richiesta",
    };
  }
}
