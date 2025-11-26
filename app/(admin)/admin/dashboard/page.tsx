import { signOutUser } from "@/app/actions/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1>Welcome, {session?.user.name}</h1> <p>Admin {session?.user.email}</p>
      <form action={signOutUser}>
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}
