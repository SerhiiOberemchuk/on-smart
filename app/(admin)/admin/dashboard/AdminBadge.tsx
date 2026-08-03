export type AdminBadgeTone = "green" | "red" | "amber" | "neutral" | "blue";

export default function AdminBadge({
  tone,
  children,
}: {
  tone: AdminBadgeTone;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/40 bg-green-500/15 text-green-300"
      : tone === "red"
        ? "border-red-500/40 bg-red-500/15 text-red-300"
        : tone === "amber"
          ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-200"
          : tone === "blue"
            ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
            : "border-slate-500/40 bg-slate-500/15 text-slate-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] ${toneClass}`}
    >
      {children}
    </span>
  );
}
