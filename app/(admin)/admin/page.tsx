import { signOutUser } from "@/app/actions/auth";
import Link from "next/link";

export default function Page() {
  return (
    <section className="admin-page flex min-h-dvh items-center justify-center p-4">
      <div className="admin-card admin-card-content w-full max-w-xl">
        <h1 className="admin-title">Головна адмін-панелі</h1>
        <p className="admin-subtitle">Ласкаво просимо до адмін-панелі OnSmart.</p>

        <div className="admin-actions mt-4">
          <Link href="/admin/dashboard" className="admin-btn-primary">
            Перейти в дашборд
          </Link>

          <form action={signOutUser}>
            <button type="submit" className="admin-btn-danger">
              Вийти
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
