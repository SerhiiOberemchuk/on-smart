"use client";

import { signInUser, signUpUser } from "@/app/actions/auth";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type Mode = "login" | "register";

export default function AdminAuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const { pending } = useFormStatus();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1">
            <span className="text-xs tracking-[0.14em] text-emerald-400 uppercase">
              OnSmart • Admin
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            {mode === "login" ? "Вхід до адмінпанелі" : "Реєстрація адміністратора"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Доступ лише для співробітників магазину. Не передавайте дані доступу третім особам.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/40 backdrop-blur-md">
          <div className="flex p-1">
            {/* <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-slate-800 text-slate-50 shadow-inner"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Увійти
            </button> */}
            {/* <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-slate-800 text-slate-50 shadow-inner"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Зареєструвати
            </button> */}
          </div>

          <div className="border-t border-slate-800" />

          <form action={mode === "login" ? signInUser : signUpUser} className="space-y-4 p-6">
            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-100">
                    Повне ім&apos;я
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Наприклад: Іван Іваненко"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                Робочий email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="name@on-smart.it"
              />
            </div>

            {/* Пароль */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Введіть пароль"
              />
            </div>

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email_verified"
                    className="block text-sm font-medium text-slate-100"
                  >
                    Підтвердити пароль
                  </label>
                  <input
                    id="email_verified"
                    name="email_verified"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Повторіть пароль"
                  />
                </div>

                {/* <div className="space-y-1.5">
                  <label htmlFor="adminCode" className="block text-sm font-medium text-slate-100">
                    Код доступу адміністратора
                  </label>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Отримайте у власника магазину"
                  />
                  <p className="text-xs text-slate-500">
                    Для безпеки нових адміністраторів реєструють лише за запитом та з використанням
                    секретного коду.
                  </p>
                </div> */}
              </>
            )}

            {/* {mode === "login" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Запам’ятати мене на цьому пристрої</span>
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Забули пароль?
                </button>
              </div>
            )} */}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending
                ? mode === "login"
                  ? "Входимо…"
                  : "Реєструємо…"
                : mode === "login"
                  ? "Увійти в адмінпанель"
                  : "Створити обліковий запис"}
            </button>

            {/* <p className="pt-1 text-center text-xs text-slate-500">
              {mode === "login"
                ? "Немає акаунта адміністратора?"
                : "Вже маєте акаунт адміністратора?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                {mode === "login" ? "Зареєструватися" : "Увійти"}
              </button>
            </p> */}
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Вхід до адмінпанелі журналюється. Несанкціонований доступ заборонений.
        </p>
      </div>
    </div>
  );
}
