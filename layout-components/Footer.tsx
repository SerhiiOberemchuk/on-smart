import LogoLink from "@/components/LogoLink";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function Footer() {
  return (
    <footer className="bg-header-footer py-4">
      <div className="container flex flex-col gap-11">
        <div className="md:flex md:h-60 md:justify-between">
          <LogoLink />
          <div className="flex flex-col gap-8 pt-6 md:max-w-[526px] md:flex-row md:gap-20 md:pt-0 lg:pt-0">
            <Navigation
              footer
              className="flex max-w-full flex-col p-0 md:mb-auto md:grid md:grid-cols-2 md:items-start md:justify-start md:gap-x-20 md:gap-y-6 xl:grid"
            />
            <address className="text_R mx-auto flex max-w-fit min-w-fit flex-col items-start gap-2 not-italic">
              <p className="uppercase">OLENA NUDZHEVSKA</p>
              <span className="decoration-0">83100 Avellino</span>
              <a href="tel:+393516930878">+393516930878</a>
              <a href="mailto:info@on-smart.it">info@on-smart.it</a>
            </address>
          </div>
        </div>

        <div className="helper_text flex flex-col items-center gap-3 border-t border-stroke-grey py-3 text-white lg:flex-row lg:justify-between lg:p-0 lg:pt-6">
          <p className="">&copy; {new Date().getFullYear()} OnSmart. Tutti i diritti riservati.</p>
          <div>
            <Link href="/informativa-sulla-privacy">Informativa sulla privacy</Link> |
            <Link href="/termini-e-condizioni">Termini e condizioni</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
