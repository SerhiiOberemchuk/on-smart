import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateTag = vi.fn();
const mockCopyFilesInS3 = vi.fn();
const mockDeleteFileFromS3 = vi.fn();

type SelectStep = {
  limitResult?: unknown;
  whereResult?: unknown;
};

let selectQueue: SelectStep[] = [];
const insertValues: unknown[] = [];
const updateValues: unknown[] = [];

function createSelectBuilder(step: SelectStep) {
  return {
    from() {
      return this;
    },
    where() {
      const whereResult = step.whereResult ?? [];
      return {
        limit: vi.fn(async () => step.limitResult ?? whereResult),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(whereResult)),
      };
    },
    limit: vi.fn(async () => step.limitResult ?? []),
  };
}

const mockDb = {
  select: vi.fn(() => createSelectBuilder(selectQueue.shift() ?? {})),
  insert: vi.fn(() => ({
    values: vi.fn((value: unknown) => {
      insertValues.push(value);
      return {
        $returningId: vi.fn(async () => [{ id: "copied-bundle-id" }]),
      };
    }),
  })),
  update: vi.fn(() => ({
    set: vi.fn((value: unknown) => {
      updateValues.push(value);
      return {
        where: vi.fn(async () => undefined),
      };
    }),
  })),
  transaction: vi.fn(async (callback: (tx: typeof mockDb) => Promise<unknown>) => callback(mockDb)),
};

vi.mock("../../../db/db", () => ({
  db: mockDb,
}));

vi.mock("../files/uploadFile", () => ({
  copyFilesInS3: mockCopyFilesInS3,
  deleteFileFromS3: mockDeleteFileFromS3,
}));

vi.mock("next/cache", () => ({
  updateTag: mockUpdateTag,
}));

describe("copyBundleById action", () => {
  beforeEach(() => {
    selectQueue = [];
    insertValues.length = 0;
    updateValues.length = 0;
    mockUpdateTag.mockReset();
    mockCopyFilesInS3.mockReset();
    mockDeleteFileFromS3.mockReset();
    mockDb.select.mockClear();
    mockDb.insert.mockClear();
    mockDb.update.mockClear();
    mockDb.transaction.mockClear();
  });

  it("writes copied file urls into bundle records", async () => {
    selectQueue = [
      {
        limitResult: [
          {
            id: "source-bundle-id",
            productType: "bundle",
            slug: "starter-bundle",
            name: "Starter",
            nameFull: "Starter Full",
            imgSrc: "https://bucket.example/bundles/main.webp",
            oldPrice: "20.00",
            rating: "5.0",
            relatedProductIds: ["old"],
            bundleIds: [],
          },
        ],
      },
      {
        limitResult: [
          {
            includedProducts: [{ productId: "prod-1", quantity: 1, shortDescription: "x" }],
            advantages: ["Adv"],
            description: "Bundle desc",
            documents: [{ title: "Guide", link: "https://bucket.example/files/guide.pdf" }],
            reviews: [{ id: "rev-1" }],
          },
        ],
      },
      {
        limitResult: [
          {
            images: ["https://bucket.example/bundles/gallery-1.webp"],
          },
        ],
      },
      { limitResult: [] },
      { limitResult: [] },
      {
        whereResult: [{ id: "prod-1", bundleIds: ["bundle-a"] }],
      },
    ];

    mockCopyFilesInS3.mockResolvedValue({
      copiedEntries: [
        { sourceUrl: "https://bucket.example/bundles/main.webp", fileUrl: "https://bucket.example/bundles/copied-main.webp" },
        { sourceUrl: "https://bucket.example/bundles/gallery-1.webp", fileUrl: "https://bucket.example/bundles/copied-gallery-1.webp" },
        { sourceUrl: "https://bucket.example/files/guide.pdf", fileUrl: "https://bucket.example/files/copied-guide.pdf" },
      ],
      urlMap: new Map([
        ["https://bucket.example/bundles/main.webp", "https://bucket.example/bundles/copied-main.webp"],
        ["https://bucket.example/bundles/gallery-1.webp", "https://bucket.example/bundles/copied-gallery-1.webp"],
        ["https://bucket.example/files/guide.pdf", "https://bucket.example/files/copied-guide.pdf"],
      ]),
    });

    const { copyBundleById } = await import("./copy-bundle");
    const result = await copyBundleById("source-bundle-id");

    expect(result).toEqual({
      success: true,
      id: "copied-bundle-id",
      error: null,
    });
    expect(insertValues[0]).toMatchObject({
      imgSrc: "https://bucket.example/bundles/copied-main.webp",
      relatedProductIds: [],
      bundleIds: [],
    });
    expect(insertValues[1]).toMatchObject({
      documents: [{ title: "Guide", link: "https://bucket.example/files/copied-guide.pdf" }],
      reviews: [],
    });
    expect(insertValues[2]).toMatchObject({
      images: ["https://bucket.example/bundles/copied-gallery-1.webp"],
    });
    expect(updateValues[0]).toMatchObject({
      bundleIds: ["bundle-a", "copied-bundle-id"],
    });
  });

  it("cleans up copied files when transaction fails", async () => {
    selectQueue = [
      {
        limitResult: [
          {
            id: "source-bundle-id",
            productType: "bundle",
            slug: "starter-bundle",
            name: "Starter",
            nameFull: "Starter Full",
            imgSrc: "https://bucket.example/bundles/main.webp",
            oldPrice: null,
            rating: null,
            relatedProductIds: [],
            bundleIds: [],
          },
        ],
      },
      { limitResult: [] },
      { limitResult: [] },
      { limitResult: [] },
      { limitResult: [] },
      { whereResult: [] },
    ];

    mockCopyFilesInS3.mockResolvedValue({
      copiedEntries: [
        { sourceUrl: "https://bucket.example/bundles/main.webp", fileUrl: "https://bucket.example/bundles/copied-main.webp" },
      ],
      urlMap: new Map([
        ["https://bucket.example/bundles/main.webp", "https://bucket.example/bundles/copied-main.webp"],
      ]),
    });
    mockDeleteFileFromS3.mockResolvedValue({ success: true });
    mockDb.transaction.mockImplementationOnce(async () => {
      throw new Error("db failed");
    });

    const { copyBundleById } = await import("./copy-bundle");
    const result = await copyBundleById("source-bundle-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("db failed");
    expect(mockDeleteFileFromS3).toHaveBeenCalledWith("https://bucket.example/bundles/copied-main.webp");
  });
});
