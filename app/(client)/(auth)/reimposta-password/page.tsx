import type { Metadata } from "next";
import ReimpostaPasswordForm from "./ReimpostaPasswordForm";

export const metadata: Metadata = {
  title: "Reimposta password — On-Smart",
  robots: { index: false, follow: false },
};

export default async function ReimpostaPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ReimpostaPasswordForm token={token ?? ""} />;
}
