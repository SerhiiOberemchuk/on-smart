import { describe, expect, it } from "vitest";

import {
  buildCopyName,
  buildUniqueCopySlugWithResolver,
  canCopyProduct,
  normalizeCopySlugBase,
} from "./copy-product.helpers";

describe("copy-product helpers", () => {
  it("normalizeCopySlugBase strips trailing copy suffixes", () => {
    expect(normalizeCopySlugBase("deshevyj")).toBe("deshevyj");
    expect(normalizeCopySlugBase("deshevyj-copy")).toBe("deshevyj");
    expect(normalizeCopySlugBase("deshevyj-copy7")).toBe("deshevyj");
    expect(normalizeCopySlugBase("  DeShevyj-CoPy12  ")).toBe("deshevyj");
  });

  it("buildCopyName creates expected labels", () => {
    expect(buildCopyName("Product", 1)).toBe("Product (copy)");
    expect(buildCopyName("Product", 2)).toBe("Product (copy 2)");
  });

  it("buildUniqueCopySlugWithResolver generates next free copy slug", async () => {
    const taken = new Set(["deshevyj-copy1", "deshevyj-copy2"]);
    const slug = await buildUniqueCopySlugWithResolver("deshevyj-copy", async (candidate) =>
      taken.has(candidate),
    );

    expect(slug).toBe("deshevyj-copy3");
  });

  it("buildUniqueCopySlugWithResolver normalizes copied slug without chaining copy-copy", async () => {
    const taken = new Set(["deshevyj-copy1"]);
    const slug = await buildUniqueCopySlugWithResolver("deshevyj-copy7", async (candidate) =>
      taken.has(candidate),
    );

    expect(slug).toBe("deshevyj-copy2");
  });

  it("buildUniqueCopySlugWithResolver throws after max attempts", async () => {
    await expect(
      buildUniqueCopySlugWithResolver("deshevyj", async () => true),
    ).rejects.toThrow("Unable to generate unique slug for product copy");
  });

  it("canCopyProduct allows only parent products", () => {
    expect(canCopyProduct({ parent_product_id: null })).toBe(true);
    expect(canCopyProduct({ parent_product_id: "01parent" })).toBe(false);
  });
});
