"use server";

import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";
import { user } from "@/auth-schema";
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type SignInActionState = {
  success: boolean;
  errorMessage: string | null;
};

export type SignUpActionState = {
  success: boolean;
  errorMessage: string | null;
};

export async function signUpUser(
  _prevState: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = (formData.get("role") as "user" | "admin" | null) ?? "user";

  if (!email || !password || !name) {
    return {
      success: false,
      errorMessage: "Для створення користувача потрібні ім'я, email і пароль.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      errorMessage: "Пароль має містити щонайменше 8 символів.",
    };
  }

  try {
    const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

    if (existingUser) {
      return {
        success: false,
        errorMessage: "Користувач із таким email уже існує.",
      };
    }

    await auth.api.createUser({ body: { email, password, name, role } });
  } catch (error) {
    console.error("[signUpUser]", error);
    return {
      success: false,
      errorMessage: "Не вдалося створити користувача. Спробуйте ще раз.",
    };
  }

  redirect(URL_DASHBOARD.ROOT);
}

export async function signInUser(
  _prevState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      errorMessage: "Введіть email і пароль.",
    };
  }

  try {
    const [account] = await db.select({ role: user.role }).from(user).where(eq(user.email, email)).limit(1);

    if (account?.role !== "admin") {
      return {
        success: false,
        errorMessage: "Невірний email, пароль або відсутній доступ до адмінпанелі.",
      };
    }

    const result = await auth.api.signInEmail({ body: { email, password } });

    if (result.user.role !== "admin") {
      return {
        success: false,
        errorMessage: "Невірний email, пароль або відсутній доступ до адмінпанелі.",
      };
    }
  } catch (error) {
    console.error("[signInUser]", error);
    return {
      success: false,
      errorMessage: "Не вдалося увійти. Перевірте дані або спробуйте ще раз.",
    };
  }

  redirect(URL_DASHBOARD.DASHBOARD);
}

export async function signOutUser() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("[signOutUser]", error);
  }

  redirect(URL_DASHBOARD.AUTH);
}
