import { describe, expect, it } from "vitest";

import {
  buildCopyName,
  buildUniqueCopySlugWithResolver,
  normalizeCopySlugBase,
} from "./copy-bundle.helpers";

describe("copy-bundle helpers", () => {
  it("normalizeCopySlugBase strips trailing copy suffixes", () => {
    expect(normalizeCopySlugBase("bundle")).toBe("bundle");
    expect(normalizeCopySlugBase("bundle-copy")).toBe("bundle");
    expect(normalizeCopySlugBase("bundle-copy7")).toBe("bundle");
    expect(normalizeCopySlugBase("  Bundle-CoPy12  ")).toBe("bundle");
  });

  it("buildCopyName creates expected labels", () => {
    expect(buildCopyName("Bundle", 1)).toBe("Bundle (copy)");
    expect(buildCopyName("Bundle", 2)).toBe("Bundle (copy 2)");
  });

  it("buildUniqueCopySlugWithResolver generates next free copy slug", async () => {
    const taken = new Set(["starter-bundle-copy1", "starter-bundle-copy2"]);
    const slug = await buildUniqueCopySlugWithResolver("starter-bundle-copy", async (candidate) =>
      taken.has(candidate),
    );

    expect(slug).toBe("starter-bundle-copy3");
  });

  it("buildUniqueCopySlugWithResolver normalizes copied slug base", async () => {
    const taken = new Set(["starter-bundle-copy1"]);
    const slug = await buildUniqueCopySlugWithResolver("starter-bundle-copy9", async (candidate) =>
      taken.has(candidate),
    );

    expect(slug).toBe("starter-bundle-copy2");
  });
});

