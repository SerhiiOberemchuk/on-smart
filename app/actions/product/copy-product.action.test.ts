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
        $returningId: vi.fn(async () => [{ id: "copied-product-id" }]),
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

describe("copyProductById action", () => {
  beforeEach(() => {
    selectQueue = [];
    insertValues.length = 0;
    mockUpdateTag.mockReset();
    mockCopyFilesInS3.mockReset();
    mockDeleteFileFromS3.mockReset();
    mockDb.select.mockClear();
    mockDb.insert.mockClear();
    mockDb.transaction.mockClear();
  });

  it("writes copied file urls into product related records", async () => {
    selectQueue = [
      {
        limitResult: [
          {
            id: "source-product-id",
            productType: "product",
            parent_product_id: null,
            slug: "camera",
            name: "Camera",
            nameFull: "Camera Full",
            imgSrc: "https://bucket.example/products/original-main.webp",
            oldPrice: "15.00",
            rating: "4.8",
            relatedProductIds: ["rel-1"],
            hasVariants: false,
            variants: [],
            bundleIds: ["bundle-a"],
          },
        ],
      },
      {
        limitResult: [
          {
            images: ["https://bucket.example/products/gallery-1.webp"],
          },
        ],
      },
      {
        limitResult: [
          {
            title: "Desc",
            description: "Body",
            images: ["https://bucket.example/products/desc-1.webp"],
          },
        ],
      },
      {
        limitResult: [
          {
            title: "Specs",
            images: ["https://bucket.example/products/spec-1.webp"],
            groups: [{ name: "A", value: "B", position: 1 }],
          },
        ],
      },
      {
        limitResult: [
          {
            documents: [{ title: "Manual", link: "https://bucket.example/files/manual.pdf" }],
          },
        ],
      },
      {
        whereResult: [
          {
            characteristic_id: "char-1",
            characteristic_name: "Power",
            value_ids: ["v1"],
          },
        ],
      },
      { limitResult: [] },
      { limitResult: [] },
    ];

    mockCopyFilesInS3.mockResolvedValue({
      copiedEntries: [
        { sourceUrl: "https://bucket.example/products/original-main.webp", fileUrl: "https://bucket.example/products/copied-main.webp" },
        { sourceUrl: "https://bucket.example/products/gallery-1.webp", fileUrl: "https://bucket.example/products/copied-gallery-1.webp" },
        { sourceUrl: "https://bucket.example/products/desc-1.webp", fileUrl: "https://bucket.example/products/copied-desc-1.webp" },
        { sourceUrl: "https://bucket.example/products/spec-1.webp", fileUrl: "https://bucket.example/products/copied-spec-1.webp" },
        { sourceUrl: "https://bucket.example/files/manual.pdf", fileUrl: "https://bucket.example/files/copied-manual.pdf" },
      ],
      urlMap: new Map([
        ["https://bucket.example/products/original-main.webp", "https://bucket.example/products/copied-main.webp"],
        ["https://bucket.example/products/gallery-1.webp", "https://bucket.example/products/copied-gallery-1.webp"],
        ["https://bucket.example/products/desc-1.webp", "https://bucket.example/products/copied-desc-1.webp"],
        ["https://bucket.example/products/spec-1.webp", "https://bucket.example/products/copied-spec-1.webp"],
        ["https://bucket.example/files/manual.pdf", "https://bucket.example/files/copied-manual.pdf"],
      ]),
    });

    const { copyProductById } = await import("./copy-product");
    const result = await copyProductById("source-product-id");

    expect(result).toEqual({
      success: true,
      id: "copied-product-id",
      error: null,
    });
    expect(mockCopyFilesInS3).toHaveBeenCalledWith([
      "https://bucket.example/products/original-main.webp",
      "https://bucket.example/products/gallery-1.webp",
      "https://bucket.example/products/desc-1.webp",
      "https://bucket.example/products/spec-1.webp",
      "https://bucket.example/files/manual.pdf",
    ]);
    expect(insertValues[0]).toMatchObject({
      imgSrc: "https://bucket.example/products/copied-main.webp",
      bundleIds: [],
    });
    expect(insertValues[1]).toMatchObject({
      images: ["https://bucket.example/products/copied-gallery-1.webp"],
    });
    expect(insertValues[2]).toMatchObject({
      images: ["https://bucket.example/products/copied-desc-1.webp"],
    });
    expect(insertValues[3]).toMatchObject({
      images: ["https://bucket.example/products/copied-spec-1.webp"],
    });
    expect(insertValues[4]).toMatchObject({
      documents: [{ title: "Manual", link: "https://bucket.example/files/copied-manual.pdf" }],
    });
  });

  it("cleans up copied files when transaction fails", async () => {
    selectQueue = [
      {
        limitResult: [
          {
            id: "source-product-id",
            productType: "product",
            parent_product_id: null,
            slug: "camera",
            name: "Camera",
            nameFull: "Camera Full",
            imgSrc: "https://bucket.example/products/original-main.webp",
            oldPrice: null,
            rating: null,
            relatedProductIds: [],
            hasVariants: false,
            variants: [],
            bundleIds: [],
          },
        ],
      },
      { limitResult: [] },
      { limitResult: [] },
      { limitResult: [] },
      { limitResult: [] },
      { whereResult: [] },
      { limitResult: [] },
      { limitResult: [] },
    ];

    mockCopyFilesInS3.mockResolvedValue({
      copiedEntries: [
        { sourceUrl: "https://bucket.example/products/original-main.webp", fileUrl: "https://bucket.example/products/copied-main.webp" },
      ],
      urlMap: new Map([
        ["https://bucket.example/products/original-main.webp", "https://bucket.example/products/copied-main.webp"],
      ]),
    });
    mockDeleteFileFromS3.mockResolvedValue({ success: true });
    mockDb.transaction.mockImplementationOnce(async () => {
      throw new Error("db failed");
    });

    const { copyProductById } = await import("./copy-product");
    const result = await copyProductById("source-product-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("db failed");
    expect(mockDeleteFileFromS3).toHaveBeenCalledWith("https://bucket.example/products/copied-main.webp");
  });
});
