import { safeRedirect } from "@/utils/safe-redirect";
import type { Metadata } from "next";
import AccediForm from "./AccediForm";

export const metadata: Metadata = {
  title: "Accedi — On-Smart",
  robots: { index: false, follow: false },
};

export default async function AccediPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <AccediForm redirect={safeRedirect(redirect, "")} />;
}
