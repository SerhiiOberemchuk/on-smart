import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardShell from "./AdminDashboardShell";
import { URL_DASHBOARD } from "./dashboard-admin.types";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    redirect(URL_DASHBOARD.AUTH);
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
