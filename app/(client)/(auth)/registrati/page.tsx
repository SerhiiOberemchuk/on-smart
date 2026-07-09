import { safeRedirect } from "@/utils/safe-redirect";
import type { Metadata } from "next";
import RegistratiForm from "./RegistratiForm";

export const metadata: Metadata = {
  title: "Registrati — On-Smart",
  robots: { index: false, follow: false },
};

export default async function RegistratiPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <RegistratiForm redirect={safeRedirect(redirect, "")} />;
}
