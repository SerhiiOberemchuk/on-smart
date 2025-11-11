import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import Image from "next/image";
import LinkYellow from "@/components/YellowLink";
import { Product } from "@/types/product.types";

type Props = { brand: string; products: Product[] };

export default function BrandPage({ brand, products }: Props) {
  const brandInfo = {
    logo: "/brands/njoi.png",
    brandName: brand,
    descriptins: [
      "Il marchio NJOY propone soluzioni innovative per la sicurezza domestica e professionale.Dalle telecamere di videosorveglianza ai sistemi di allarme e ai dispositivi smart, ogni prodotto NJOY è progettato per offrire massima affidabilità, facilità d`uso e tecnologia all`avanguardia.",
      "Grazie a NJOY puoi monitorare, proteggere e gestire i tuoi spazi in modo intelligente, migliorando la sicurezza e il comfort della tua casa o del tuo ufficio. Scegli NJOY — la tecnologia che rende la tua vita più sicura e connessa.",
      "Grazie a NJOY puoi monitorare, proteggere e gestire i tuoi spazi in modo intelligente, migliorando la sicurezza e il comfort della tua casa o del tuo ufficio. Scegli NJOY — la tecnologia che rende la tua vita più sicura e connessa.",
    ],
  };

  return (
    <>
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{brandInfo.brandName}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <Image
              src={brandInfo.logo}
              width={492}
              height={270}
              alt={brandInfo.brandName + "- Logo"}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {brandInfo.descriptins.map((desc, index) => (
                <li key={index}>
                  <p className="text_R"> {desc}</p>
                </li>
              ))}
              <LinkYellow title="Mostra tutto" href="/catalogo" className="mr-auto flex" />
            </ul>
          </div>
        </div>
      </section>
      <ProductRowListSection
        productsList={products}
        title="I best seller del marchio"
        idSection="brand_best_sellers"
        isBottomLink={true}
      />
    </>
  );
}
