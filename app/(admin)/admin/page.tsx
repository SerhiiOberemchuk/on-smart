import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.role === "admin") {
    redirect(URL_DASHBOARD.DASHBOARD);
  }

  redirect(URL_DASHBOARD.AUTH);
}
