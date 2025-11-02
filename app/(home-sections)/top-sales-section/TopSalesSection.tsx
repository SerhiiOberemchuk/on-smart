export default function TopSalesSection() {
  const hand = () => {
    console.log("fsdfsd");
  };
  return (
    <section id="top-sales-section" className="py-16">
      <div className="container flex items-center justify-between bg-background py-3">
        <h2 className="H2">Più venduto</h2>
        <nav>
          {/* <ButtonArrow direction="left" onClick={hand} /> */}
          {/* <ButtonArrow direction="right" onClick={console.log("right")} /> */}
        </nav>
      </div>
    </section>
  );
}
