"use client";

import { signInUser, type SignInActionState } from "@/app/actions/auth";
import { useActionState, useEffect, useRef } from "react";

const INITIAL_STATE: SignInActionState = {
  success: false,
  errorMessage: null,
};

export default function AdminAuthForm() {
  const [state, formAction, pending] = useActionState(signInUser, INITIAL_STATE);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.errorMessage) {
      return;
    }

    if (passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
  }, [state.errorMessage]);

  return (
    <div className="admin-card admin-card-content admin-auth-card">
      <form action={formAction} className="admin-auth-form">
        <div className="admin-field">
          <label htmlFor="email" className="admin-field-label">
            Робочий email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={pending}
            className="admin-input"
            placeholder="name@on-smart.it"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="password" className="admin-field-label">
            Пароль
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={pending}
            className="admin-input"
            placeholder="Введіть пароль"
          />
        </div>

        {state.errorMessage ? (
          <div className="admin-auth-alert admin-auth-alert-error">
            {state.errorMessage}
          </div>
        ) : null}

        {pending ? (
          <div className="admin-auth-alert admin-auth-alert-pending">
            Перевіряємо дані та відкриваємо адмінпанель...
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="admin-btn-primary admin-auth-submit"
        >
          {pending ? "Входимо..." : "Увійти в адмінпанель"}
        </button>
      </form>
    </div>
  );
}
