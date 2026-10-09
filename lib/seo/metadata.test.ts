import { describe, expect, it } from "vitest";
import {
  buildLandingPageRobots,
  buildProductSeoTitle,
  formatEuroPrice,
  isLandingPageIndexable,
} from "./metadata";

describe("buildProductSeoTitle", () => {
  const price = formatEuroPrice(28.8);

  it("appends the brand only when the name does not already mention it", () => {
    expect(
      buildProductSeoTitle({ name: "Telecomando SPACECONTROL", brandName: "Ajax Systems" }),
    ).toBe("Telecomando SPACECONTROL Ajax Systems");
    expect(
      buildProductSeoTitle({ name: "Telecomando AJAX SPACECONTROL", brandName: "Ajax Systems" }),
    ).toBe("Telecomando AJAX SPACECONTROL");
    expect(
      buildProductSeoTitle({ name: "UPS TECNONEW TN-1200VA-LCD", brandName: "TECNONEW" }),
    ).toBe("UPS TECNONEW TN-1200VA-LCD");
  });

  it("puts the price after the name and never adds an EAN or ellipsis", () => {
    const title = buildProductSeoTitle({
      name: "Telecomando AJAX SPACECONTROL",
      brandName: "Ajax Systems",
      price,
    });

    expect(title).toBe(`Telecomando AJAX SPACECONTROL – ${price}`);
    expect(title).not.toContain("…");
  });

  it("drops the brand before shortening the name, and keeps the price", () => {
    const title = buildProductSeoTitle({
      name: "Kit di allarme AJAX HUB2PLUS con rilevatori volumetrici e contatti magnetici",
      brandName: "Ajax Systems",
      price: formatEuroPrice(1239.3),
    });

    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith(`– ${formatEuroPrice(1239.3)}`)).toBe(true);
    expect(title).not.toContain("Ajax Systems");
    expect(title).not.toContain("…");
  });

  it("works without a brand or price", () => {
    expect(buildProductSeoTitle({ name: "  Matassa   LAN Cat.6  " })).toBe("Matassa LAN Cat.6");
  });
});

describe("isLandingPageIndexable", () => {
  it("deindexes only a confirmed empty result", () => {
    expect(isLandingPageIndexable({ success: true, data: [{ id: "p1" }] })).toBe(true);
    expect(isLandingPageIndexable({ success: true, data: [] })).toBe(false);
  });

  it("keeps the page indexed when the product read failed", () => {
    expect(isLandingPageIndexable({ success: false, data: [] })).toBe(true);
  });
});

describe("buildLandingPageRobots", () => {
  it("indexes a landing page that has products", () => {
    expect(buildLandingPageRobots(true)).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });
  });

  it("keeps an empty landing page crawlable but out of the index", () => {
    expect(buildLandingPageRobots(false)).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });
});
