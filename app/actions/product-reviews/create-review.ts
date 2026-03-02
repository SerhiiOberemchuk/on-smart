"use server";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { transporterAssistance } from "@/lib/mail-transporter";

type ProductReviewActionState = {
  success: boolean;
  message?: string;
  error?: unknown;
};

type ProductReviewNotificationPayload = {
  productId: string;
  productName: string;
  productSlug: string;
  productCategorySlug: string;
  productBrandSlug: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  comment: string;
};

const MIN_RATING = 1;
const MAX_RATING = 5;
const TELEGRAM_API_BASE_URL = "https://api.telegram.org";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseRating(rawRating: string) {
  const rating = Number(rawRating);
  if (!Number.isInteger(rating)) return null;
  if (rating < MIN_RATING || rating > MAX_RATING) return null;
  return rating;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendReviewEmails(payload: ProductReviewNotificationPayload) {
  const adminEmail = process.env.MAIL_USER_ASSISTENZA;
  if (!adminEmail) return;

  const fromEmail = process.env.MAIL_USER_ASSISTENZA;
  const productPublicUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/catalogo/${encodeURIComponent(payload.productCategorySlug)}/${encodeURIComponent(payload.productBrandSlug)}/${encodeURIComponent(payload.productSlug)}`
    : null;

  const adminText = [
    "Nuova recensione prodotto (in attesa di approvazione)",
    "",
    `Prodotto: ${payload.productName}`,
    `ID prodotto: ${payload.productId}`,
    `Rating: ${payload.rating}/5`,
    `Cliente: ${payload.clientName}`,
    `Email cliente: ${payload.clientEmail}`,
    "",
    "Commento:",
    payload.comment,
    "",
    productPublicUrl ? `Link prodotto: ${productPublicUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const customerText = [
    `Ciao ${payload.clientName},`,
    "",
    "grazie per aver inviato la tua recensione su On-Smart.",
    "Il nostro team la verifichera a breve prima della pubblicazione.",
    "",
    `Prodotto: ${payload.productName}`,
    `Valutazione: ${payload.rating}/5`,
    "",
    "Grazie per il tuo contributo.",
    "Team On-Smart",
  ].join("\n");

  await Promise.allSettled([
    transporterAssistance.sendMail({
      from: `"Assistenza On-Smart" <${fromEmail}>`,
      to: adminEmail,
      replyTo: payload.clientEmail,
      subject: `[RECENSIONE PRODOTTO] ${payload.productName} (${payload.rating}/5)`,
      text: adminText,
    }),
    transporterAssistance.sendMail({
      from: `"Assistenza On-Smart" <${fromEmail}>`,
      to: payload.clientEmail,
      subject: "Grazie per la tua recensione - On-Smart",
      text: customerText,
    }),
  ]);
}

async function sendReviewTelegramNotification(payload: ProductReviewNotificationPayload) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (!token || !chatId) return;

  const adminProductUrl = siteUrl
    ? `${siteUrl}/admin/dashboard/products/${encodeURIComponent(payload.productId)}`
    : null;
  const reply_markup =
    isProduction && adminProductUrl
      ? {
          inline_keyboard: [[{ text: "Apri prodotto in admin", url: adminProductUrl }]],
        }
      : undefined;

  const text = [
    "<b>NUOVA RECENSIONE PRODOTTO</b>",
    `Prodotto: <b>${escapeHtml(payload.productName)}</b>`,
    `ID: <code>${escapeHtml(payload.productId)}</code>`,
    `Valutazione: <b>${payload.rating}/5</b>`,
    `Cliente: ${escapeHtml(payload.clientName)}`,
    `Email: ${escapeHtml(payload.clientEmail)}`,
    `Commento: ${escapeHtml(payload.comment)}`,
    adminProductUrl ? `Link: ${escapeHtml(adminProductUrl)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(`${TELEGRAM_API_BASE_URL}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(reply_markup ? { reply_markup } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} - ${body}`);
  }
}

export async function createProductReview(
  _prevState: ProductReviewActionState,
  data: FormData,
): Promise<ProductReviewActionState> {
  const product_id = getFormValue(data, "productId");
  const client_name = getFormValue(data, "nome");
  const email = getFormValue(data, "email");
  const rating = parseRating(getFormValue(data, "rating"));
  const comment = getFormValue(data, "messaggio");

  if (!product_id || !client_name || !email || !comment || rating === null) {
    return { success: false, message: "Compila tutti i campi richiesti." };
  }

  if (!isValidEmail(email)) {
    return { success: false, message: "Inserisci un indirizzo email valido." };
  }

  try {
    const [product] = await db
      .select({
        id: productsSchema.id,
        name: productsSchema.name,
        slug: productsSchema.slug,
        category_slug: productsSchema.category_slug,
        brand_slug: productsSchema.brand_slug,
      })
      .from(productsSchema)
      .where(eq(productsSchema.id, product_id))
      .limit(1);

    await db.insert(productReviewsSchema).values({
      product_id,
      client_name,
      email,
      rating,
      comment,
      is_approved: false,
    });

    updateTag(CACHE_TAGS.product.reviewsById(product_id));

    const payload: ProductReviewNotificationPayload = {
      productId: product_id,
      productName: product?.name ?? `Prodotto #${product_id}`,
      productSlug: product?.slug ?? "",
      productCategorySlug: product?.category_slug ?? "",
      productBrandSlug: product?.brand_slug ?? "",
      clientName: client_name,
      clientEmail: email,
      rating,
      comment,
    };

    const results = await Promise.allSettled([
      sendReviewEmails(payload),
      sendReviewTelegramNotification(payload),
    ]);

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[createProductReview] notification failed:", result.reason);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[createProductReview] failed:", error);
    return {
      success: false,
      message: "Errore durante l'invio della recensione.",
      error,
    };
  }
}
