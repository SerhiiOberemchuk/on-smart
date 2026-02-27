import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Дашборд</h1>
          <p className="admin-subtitle">Швидкий огляд адмін-панелі</p>
        </div>
      </div>

      <div className="admin-card admin-card-content">
        <div className="admin-grid-2">
          <div className="admin-kv-list">
            <div className="admin-kv">
              <span className="admin-kv-key">Ім'я</span>
              <span className="admin-kv-value">{session?.user.name ?? "-"}</span>
            </div>
            <div className="admin-kv">
              <span className="admin-kv-key">Ел. пошта</span>
              <span className="admin-kv-value">{session?.user.email ?? "-"}</span>
            </div>
          </div>

          <div className="admin-kv-list">
            <div className="admin-kv">
              <span className="admin-kv-key">Роль</span>
              <span className="admin-kv-value">Адміністратор</span>
            </div>
            <div className="admin-kv">
              <span className="admin-kv-key">Статус</span>
              <span className="admin-kv-value">Активна сесія</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
