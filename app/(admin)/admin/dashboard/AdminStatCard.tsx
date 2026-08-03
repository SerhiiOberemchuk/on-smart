export default function AdminStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="admin-card admin-card-content">
      <div className="text-xs font-medium tracking-wide uppercase admin-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-0.5 text-xs admin-muted">{hint}</div> : null}
    </div>
  );
}
