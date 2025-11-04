import LinkYellow from "@/components/YellowLink";
import ProductsList from "./ProductList/ProductsList";

export default async function TopSalesSection() {
  return (
    <section id="top-sales-section" className="flex flex-col gap-6 py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 className="H2">Più venduto</h2>
          <nav>
            {/* <ButtonArrow direction="left"  /> */}
            {/* <ButtonArrow direction="right"  /> */}
          </nav>
        </div>
      </div>
      <ProductsList />
      <LinkYellow href="/catalogo" title="Vai allo shop" className="mx-auto flex w-fit" />
    </section>
  );
}
