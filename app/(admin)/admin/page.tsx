import { signOutUser } from "@/app/actions/auth";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-xl flex-col justify-center rounded-xl border border-gray-500 p-5">
        <h1 className="mb-4 text-2xl font-bold">Admin Home Page</h1>
        <p className="mb-4">Welcome to the admin dashboard.</p>
        <Link
          href="/admin/dashboard"
          className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go to Dashboard
        </Link>

        <form action={signOutUser} className="mt-6 flex justify-center">
          <button
            type="submit"
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
