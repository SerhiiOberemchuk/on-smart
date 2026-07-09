import type { Metadata } from "next";
import PasswordDimenticataForm from "./PasswordDimenticataForm";

export const metadata: Metadata = {
  title: "Password dimenticata — On-Smart",
  robots: { index: false, follow: false },
};

export default function PasswordDimenticataPage() {
  return <PasswordDimenticataForm />;
}
