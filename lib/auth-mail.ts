import { transporterAssistance } from "@/lib/mail-transporter";

type AuthMailKind = "verify-email" | "reset-password";

function emailShell(heading: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 3px solid #EAB308;">
        <h1 style="margin: 0; color: #333; font-size: 24px;">On-Smart</h1>
        <p style="margin: 5px 0 0; color: #666;">${heading}</p>
      </div>
      <div style="padding: 24px; font-size: 15px; line-height: 1.6;">
        ${bodyHtml}
      </div>
      <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2026 On-Smart. Tutti i diritti riservati.</p>
      </div>
    </div>
  `;
}

function ctaButton(url: string, label: string): string {
  return `
    <p style="text-align: center; margin: 28px 0;">
      <a href="${url}" style="background-color: #EAB308; color: #333; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 6px; display: inline-block;">${label}</a>
    </p>
    <p style="font-size: 13px; color: #666;">Se il pulsante non funziona, copia e incolla questo link nel browser:<br><a href="${url}" style="color: #666;">${url}</a></p>
  `;
}

function verifyEmailBody(name: string, url: string): string {
  return `
    <p>Ciao ${name},</p>
    <p>grazie per esserti registrato su On-Smart. Conferma il tuo indirizzo email per attivare il tuo account.</p>
    ${ctaButton(url, "Conferma email")}
    <p style="color: #666;">Il link scade tra 24 ore. Se non hai creato tu un account, ignora questa email.</p>
  `;
}

function resetPasswordBody(name: string, url: string): string {
  return `
    <p>Ciao ${name},</p>
    <p>abbiamo ricevuto una richiesta di reimpostazione della password del tuo account On-Smart.</p>
    ${ctaButton(url, "Reimposta password")}
    <p style="color: #666;">Se non hai richiesto tu la reimpostazione, ignora questa email: la password resta invariata.</p>
  `;
}

export async function sendAuthMail(
  kind: AuthMailKind,
  params: { to: string; url: string; name?: string },
): Promise<void> {
  const name = params.name?.trim() || "Cliente";

  const { subject, html } =
    kind === "verify-email"
      ? {
          subject: "Conferma il tuo indirizzo email — On-Smart",
          html: emailShell("Conferma la tua email", verifyEmailBody(name, params.url)),
        }
      : {
          subject: "Reimposta la tua password — On-Smart",
          html: emailShell("Reimposta la password", resetPasswordBody(name, params.url)),
        };

  await transporterAssistance.sendMail({
    from: `"On-Smart" <${process.env.MAIL_USER_ASSISTENZA}>`,
    to: params.to,
    subject,
    html,
  });
}
