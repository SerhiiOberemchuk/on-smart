import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminAuthForm from "./AdminAuthForm";

export default async function AdminAuthPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.role === "admin") {
    redirect(URL_DASHBOARD.DASHBOARD);
  }

  return (
    <section className="admin-page admin-auth-page">
      <div className="admin-auth-wrap">
        <div className="admin-page-header admin-auth-header">
          <div>
            <div className="admin-chip admin-auth-chip">OnSmart • Адмінка</div>
            <h1 className="admin-title mt-3">Вхід до адмінпанелі</h1>
            <p className="admin-subtitle">
              Доступ лише для співробітників магазину. Не передавайте дані доступу третім особам.
            </p>
          </div>
        </div>

        <AdminAuthForm />

        <p className="admin-auth-footnote">
          Вхід до адмінпанелі журналюється. Несанкціонований доступ заборонений.
        </p>
      </div>
    </section>
  );
}
