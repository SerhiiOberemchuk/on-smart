import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <section className="admin-card admin-card-content w-full max-w-xl text-center">
        <span className="admin-chip mx-auto mb-4">404</span>
        <h1 className="admin-title">Сторінку адмінки не знайдено</h1>
        <p className="admin-subtitle mx-auto max-w-md">
          Запис міг бути видалений або посилання більше не актуальне. Поверніться до панелі
          керування і відкрийте потрібний розділ з меню.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/admin/dashboard" className="admin-btn-primary">
            До панелі керування
          </Link>
        </div>
      </section>
    </div>
  );
}
