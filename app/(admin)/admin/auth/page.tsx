"use client";

import { signInUser } from "@/app/actions/auth";
import { useFormStatus } from "react-dom";
// import { useForm } from "react-hook-form";

export default function AdminAuthPage() {
  const { pending } = useFormStatus();
  // const { register } = useForm<{ email: string; password: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1">
            <span className="text-xs tracking-[0.14em] text-emerald-400 uppercase">
              OnSmart • Адмінка
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            Вхід до адмінпанелі
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Доступ лише для співробітників магазину. Не передавайте дані доступу третім особам.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/40 backdrop-blur-md">
          <form action={signInUser} className="space-y-4 p-6">
            <label htmlFor="role" className="sr-only">
              Роль адміністратора
              <input type="checkbox" name="role" id="role" value="admin" defaultChecked={true} />
            </label>

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

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={"current-password"}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 ring-0 transition outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Введіть пароль"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Входимо…" : "Увійти в адмінпанель"}
            </button>

            <p className="pt-1 text-center text-xs text-slate-500"></p>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Вхід до адмінпанелі журналюється. Несанкціонований доступ заборонений.
        </p>
      </div>
    </div>
  );
}
