import LayoutNavigationPrivacyPages from "@/components/LayoutNavigationPrivacyPages";

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex flex-col xl:flex-row xl:gap-[72px]">
      <LayoutNavigationPrivacyPages />
      {children}
    </div>
  );
}
