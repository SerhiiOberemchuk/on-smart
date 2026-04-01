"use client";

import { useFormStatus } from "react-dom";

export default function AdminSignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-logout-btn" disabled={pending}>
      {pending ? "Виходимо..." : "Вийти"}
    </button>
  );
}
