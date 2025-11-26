import LayoutNavigationPrivacyPages from "@/components/LayoutNavigationPrivacyPages";

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex flex-col pt-3 pb-6 xl:flex-row xl:gap-[72px]">
      <LayoutNavigationPrivacyPages />
      <section className="max-w-[860px] flex-1">{children}</section>
    </div>
  );
}
