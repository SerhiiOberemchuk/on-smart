import Image from "next/image";
import icon_punkt from "@/assets/icons/punkt.svg";
import { getAllBrands } from "@/app/actions/brands/brand-actions";
import icon_quote from "@/assets/icons/icon_quote.svg";
import icon_mail from "@/assets/icons/icon_mail.svg";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Chi siamo | On Smart – Videosorveglianza, Sicurezza, Soluzioni Smart",
  description:
    "Scopri la mission di On Smart: videosorveglianza, dispositivi smart, UPS e soluzioni professionali per la sicurezza di case, negozi e aziende. Marchi affidabili, assistenza tecnica e supporto qualificato.",
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}/chi-siamo`,
  },
  openGraph: {
    title: "Chi siamo | On Smart",
    description:
      "Soluzioni affidabili per la sicurezza: videosorveglianza, tecnologia smart, UPS e dispositivi professionali. La filosofia e l'approccio di On Smart.",
    url: `${CONTACTS_ADDRESS.BASE_URL}/chi-siamo`,
    siteName: "On Smart",
    images: [
      {
        url: "/images/chi_siamo_banner.jpg",
        width: 1200,
        height: 630,
        alt: "On Smart – Chi siamo",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

export default async function CarrelloPage() {
  const brands = await getAllBrands();
  return (
    <>
      <section className="py-16">
        <div className="container flex flex-col items-center justify-between gap-5 xl:flex-row">
          <Image
            width={670}
            height={400}
            alt="Chi-siamo banner"
            src={"/images/chi_siamo_banner.jpg"}
          />
          <ul className="body_R_20 flex max-w-[556px] min-w-[280px] flex-col gap-5">
            {[
              "On Smart nasce con l’obiettivo di offrire soluzioni professionali di videosorveglianza, sicurezza e tecnologia smart, accessibili e affidabili per abitazioni e aziende.",
              " Il progetto è il risultato di una lunga esperienza nel settore della videosorveglianza e dell’elettronica, unita all’attenzione verso prodotti di qualità e assistenza chiara e trasparente.",
              "L’idea alla base di On Smart è semplice: offrire strumenti tecnologici selezionati con cura, capaci di migliorare la protezione di abitazioni, negozi e spazi professionali, mantenendo sempre un equilibrio tra qualità, semplicità e convenienza.",
            ].map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="bg-background py-20">
        <div className="container flex items-center justify-center">
          <div className="flex w-full max-w-[556px] flex-col gap-3">
            <h2 className="H1 text-center">Cosa facciamo</h2>
            <p className="H4M text-center">On Smart propone un catalogo dedicato a:</p>
            <ul className="body_R_20 flex flex-col gap-3">
              {[
                "Sistemi di videosorveglianza IP e analogici",
                "Soluzioni smart per la gestione degli ambienti",
                "Dispositivi e accessori per installatori e professionisti",
                "Sistemi di continuità elettrica UPS (gruppi di continuità)",
                "Prodotti pensati per la sicurezza sia domestica che aziendale",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Image src={icon_punkt} width={24} height={24} alt="Punkt icon" /> {item}
                </li>
              ))}
            </ul>
            <p className="body_R_20">
              Ogni articolo viene scelto valutando prestazioni, stabilità, facilità di
              configurazione e compatibilità con impianti moderni.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16">
        <SectionHeader title="Marchi trattati" />
        <div className="container mt-8 flex flex-col gap-6">
          <p className="H4M max-w-[680px]">
            Nel catalogo sono presenti prodotti appartenenti a marchi noti e apprezzati nel settore:
          </p>
          {brands.data && (
            <ul className="flex flex-wrap justify-center gap-3">
              {brands.data.map((brand) => (
                <li key={brand.id} className="flex items-center justify-center">
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    width={150}
                    height={32}
                    className="h-auto w-fit object-contain object-center px-7 py-8"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="H4M">e altri marchi selezionati in base alla qualità e all’affidabilità.</p>
        </div>
      </section>
      <section className="py-16">
        <SectionHeader title="Il nostro approccio" />
        <div className="container mt-8 flex flex-col items-center justify-center gap-6 xl:flex-row xl:items-start">
          <Image
            src={"/images/chi_siamo_appr.jpg"}
            width={670}
            height={400}
            alt="Il nostro approccio"
          />
          <div className="flex max-w-[556px] flex-col gap-5">
            <p className="body_R_20">Lavoriamo con attenzione, con un impegno costante verso:</p>
            <ul className="flex flex-col gap-3">
              {[
                "Informazioni tecniche chiare e comprensibili",
                "Selezione accurata dei fornitori",
                "Supporto competente prima e dopo la vendita",
                "Spedizioni tutelate e tracciabili",
                "Documentazione fiscale conforme alla normativa italiana",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Image src={icon_punkt} width={24} height={24} alt="Punkt icon" /> {item}
                </li>
              ))}
            </ul>
            <p className="body_R_20">Ogni acquisto deve essere semplice, trasparente e sicuro</p>
          </div>
        </div>
      </section>
      <section className="bg-background py-32">
        <div className="container flex justify-center">
          <div className="flex max-w-[556px] flex-col gap-3">
            <h2 className="H1 text-center">La nostra filosofia</h2>
            <Image src={icon_quote} width={34} height={24} alt="Quote icon" />
            <p className="H4M">
              Crediamo nelle soluzioni che facilitano la vita quotidiana, nel valore della
              protezione degli spazi in cui viviamo e lavoriamo, e nell’importanza di un’assistenza
              che mette al centro le persone. Offriamo supporto con professionalità, attenzione e
              disponibilità, cercando sempre la soluzione più adatta alle esigenze reali.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16">
        <SectionHeader title="Assistenza" />
        <div className="container mt-8 flex flex-col gap-5">
          <h3 className="H4M max-w-[580px]">
            Per richieste, informazioni sui prodotti o supporto tecnico, è possibile contattarci via
            e-mail:
          </h3>
          <a href={`mailto:${CONTACTS_ADDRESS.EMAIL}`} className="H4M flex items-center gap-3">
            <Image src={icon_mail} width={24} height={24} alt="Mail icon" />
            {CONTACTS_ADDRESS.EMAIL}
          </a>
        </div>
      </section>
      <Script
        id="json-ld-chi-siamo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Chi siamo - On Smart",
            description:
              "On Smart offre soluzioni affidabili per la videosorveglianza, la sicurezza e la gestione smart di ambienti domestici e professionali.",
            url: `${CONTACTS_ADDRESS.BASE_URL}/chi-siamo`,
            publisher: {
              "@type": "Organization",
              name: "On Smart",
              url: CONTACTS_ADDRESS.BASE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${CONTACTS_ADDRESS.BASE_URL}/logo.png`,
              },
              email: CONTACTS_ADDRESS.EMAIL,
            },
            mainEntity: [
              {
                "@type": "ItemList",
                name: "Cosa facciamo",
                itemListElement: [
                  "Sistemi di videosorveglianza IP e analogici",
                  "Soluzioni smart per la gestione degli ambienti",
                  "Dispositivi e accessori per installatori",
                  "UPS e gruppi di continuità",
                  "Prodotti per sicurezza domestica e professionale",
                ],
              },
              {
                "@type": "ItemList",
                name: "Marchi trattati",
                itemListElement:
                  brands?.data?.map((b, index) => ({
                    "@type": "Brand",
                    position: index + 1,
                    name: b.name,
                    logo: b.image,
                  })) ?? [],
              },
              {
                "@type": "ItemList",
                name: "Il nostro approccio",
                itemListElement: [
                  "Informazioni tecniche chiare",
                  "Selezione accurata dei fornitori",
                  "Supporto prima e dopo la vendita",
                  "Spedizioni tracciabili",
                  "Documentazione fiscale conforme alla normativa italiana",
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Come posso contattare l'assistenza?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Puoi contattarci via e-mail all’indirizzo ${CONTACTS_ADDRESS.EMAIL}.`,
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <header className="bg-background">
      <div className="container py-3">
        <h2 className="H2">{title}</h2>
      </div>
    </header>
  );
}
