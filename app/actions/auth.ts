"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  await auth.api.signUpEmail({ body: { email, password, name } });
  redirect("/admin");
}

export async function signInUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  await auth.api.signInEmail({ body: { email, password } });
  redirect("/admin");
}

export async function signOutUser() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/auth");
}
