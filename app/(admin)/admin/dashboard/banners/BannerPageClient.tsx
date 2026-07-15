"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";

import { saveSiteBanner } from "@/app/actions/admin/site-banner/mutations";
import type { SiteBannerType } from "@/db/schemas/site-banner.schema";
import {
  SITE_BANNER_VARIANT_OPTIONS,
  SITE_BANNER_VARIANT_STYLES,
  type SiteBannerVariant,
} from "@/types/site-banner.types";

function MegaphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d="M3 11v2a1 1 0 0 0 1 1h2l4 3V7L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M10 7 18 4v16l-8-3" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </svg>
  );
}

export default function BannerPageClient({ initialData }: { initialData: SiteBannerType | null }) {
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? false);
  const [variant, setVariant] = useState<SiteBannerVariant>(initialData?.variant ?? "info");
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl ?? "");
  const [linkLabel, setLinkLabel] = useState(initialData?.linkLabel ?? "");
  const [isPending, startTransition] = useTransition();

  const trimmedMessage = message.trim();
  const previewClass = SITE_BANNER_VARIANT_STYLES[variant] ?? SITE_BANNER_VARIANT_STYLES.info;
  const willShow = isActive && trimmedMessage.length > 0;

  const handleSave = () => {
    if (isActive && !trimmedMessage) {
      toast.warning("Введіть текст оголошення або вимкніть банер");
      return;
    }

    startTransition(async () => {
      const res = await saveSiteBanner({
        message,
        isActive,
        variant,
        linkUrl: linkUrl.trim() || null,
        linkLabel: linkLabel.trim() || null,
      });

      if (!res.success) {
        toast.error("Помилка збереження банера");
        return;
      }

      toast.success("Банер збережено");
    });
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Банер оголошень</h1>
          <p className="admin-subtitle">
            Показується у верхній частині сайту під шапкою на всіх сторінках. Якщо текст порожній
            або банер вимкнено — він не відображається.
          </p>
        </div>
      </div>

      {/* Live preview */}
      <div className="admin-card admin-card-content">
        <p className="admin-field-label mb-2">Попередній перегляд</p>
        {willShow ? (
          <div className={`overflow-hidden rounded-md ${previewClass}`}>
            <div className="flex items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium">
              <MegaphoneIcon />
              <p className="leading-snug">
                {trimmedMessage}
                {linkUrl.trim() ? (
                  <span className="ml-2 font-semibold underline decoration-2 underline-offset-2">
                    {linkLabel.trim() || "Докладніше"} →
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ) : (
          <div className="admin-empty">
            {isActive ? "Введіть текст, щоб побачити банер." : "Банер вимкнено — нічого не показується."}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="admin-card admin-card-content mt-4 space-y-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5 accent-yellow-500"
          />
          <span className="text-sm font-medium">Показувати банер на сайті</span>
        </label>

        <div className="admin-field">
          <span className="admin-field-label">Текст оголошення</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напр.: Магазин зачинено на святкові дні з 24 до 26 грудня. Замовлення приймаються онлайн."
            className="admin-textarea"
            maxLength={300}
          />
          <span className="text-xs text-slate-500">{message.length}/300 символів</span>
        </div>

        <div className="admin-field">
          <span className="admin-field-label">Стиль</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as SiteBannerVariant)}
            className="admin-input"
          >
            {SITE_BANNER_VARIANT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="admin-field">
            <span className="admin-field-label">Посилання (за бажанням)</span>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/spedizione або https://..."
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Підпис посилання</span>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Докладніше"
              className="admin-input"
              maxLength={120}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="admin-btn-primary"
          >
            {isPending ? "Збереження..." : "Зберегти"}
          </button>
        </div>
      </div>
    </section>
  );
}
