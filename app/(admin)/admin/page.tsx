import { signOutUser } from "@/app/actions/auth";
import LinkYellow from "@/components/YellowLink";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminMainPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-6">
      <h1>Welcome, {session?.user.name}</h1> <p>Admin {session?.user.email}</p>
      <LinkYellow href="/admin/dashboard" title="Адмін панель" />
      <form action={signOutUser}>
        <button type="submit">Вийти</button>
      </form>
    </div>
  );
}
