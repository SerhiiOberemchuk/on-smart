import LogoLink from "@/components/LogoLink";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import icon_location from "@/assets/icons/icon_location.svg";
import icon_mail from "@/assets/icons/icon_mail.svg";
import icon_phone from "@/assets/icons/icon_phone.svg";
import Image from "next/image";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";

export default async function Footer() {
  return (
    <footer className="bg-header-footer py-4">
      <div className="container flex flex-col gap-11">
        <div className="md:flex md:h-60 md:justify-between">
          <LogoLink />
          <div className="flex flex-col gap-8 pt-6 md:max-w-[526px] md:flex-row md:gap-20 md:pt-0 lg:pt-0">
            <Suspense>
              <Navigation
                footer
                className="flex max-w-full flex-col p-0 md:mb-auto md:grid md:grid-cols-2 md:items-start md:justify-start md:gap-x-20 md:gap-y-6 xl:grid"
              />
            </Suspense>
            <address className="text_R mx-auto flex max-w-fit min-w-fit flex-col items-start gap-2 not-italic">
              <p className="uppercase">
                {CONTACTS_ADDRESS.OWNER.NAME} {CONTACTS_ADDRESS.OWNER.SURNAME}
              </p>
              <span className="flex items-center gap-1">
                <Image src={icon_location} alt="indirizzo" aria-hidden />
                <span>
                  {CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE} {CONTACTS_ADDRESS.ADDRESS.CITY}
                </span>
              </span>
              <a
                className="flex items-center gap-1 xl:hover:scale-105"
                href={`tel:${CONTACTS_ADDRESS.PHONE_NUMBER}`}
              >
                <Image src={icon_phone} alt="telefono" aria-hidden />
                <span>{CONTACTS_ADDRESS.PHONE_NUMBER}</span>
              </a>
              <a
                className="flex items-center gap-1 xl:hover:scale-105"
                href={`mailto:${CONTACTS_ADDRESS.EMAIL}`}
              >
                <Image src={icon_mail} alt="email" aria-hidden />
                <span>{CONTACTS_ADDRESS.EMAIL}</span>
              </a>
            </address>
          </div>
        </div>

        <div className="helper_text flex flex-col items-center gap-3 border-t border-stroke-grey py-3 text-white lg:flex-row lg:justify-between lg:p-0 lg:pt-6">
          <Suspense>
            <CopyElement />
          </Suspense>
          <div>
            <Link href="/informativa-sulla-privacy">Informativa sulla privacy</Link> |
            <Link href="/informativa-sulla-privacy">Termini e condizioni</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

async function CopyElement() {
  "use cache";
  cacheTag("footer_copy_element");
  cacheLife({ expire: 3600 }); // 1 hour
  return <p className="">&copy; {new Date().getFullYear()} OnSmart. Tutti i diritti riservati.</p>;
}
