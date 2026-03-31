const COPY_SUFFIX = "copy";
const COPY_SUFFIX_REGEX = /-copy(?:\d+)?$/i;
const MAX_COPY_ATTEMPTS = 1000;

export type ProductCopyAccessInput = {
  parent_product_id: string | null;
};

export function normalizeCopySlugBase(baseSlug: string): string {
  return baseSlug.trim().toLowerCase().replace(COPY_SUFFIX_REGEX, "");
}

export async function buildUniqueCopySlugWithResolver(
  baseSlug: string,
  slugExists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const normalizedBase = normalizeCopySlugBase(baseSlug);
  const baseCandidate = `${normalizedBase}-${COPY_SUFFIX}`;

  let counter = 1;
  while (counter < MAX_COPY_ATTEMPTS) {
    const candidate = `${baseCandidate}${counter}`;
    const exists = await slugExists(candidate);

    if (!exists) return candidate;
    counter += 1;
  }

  throw new Error("Unable to generate unique slug for product copy");
}

export function buildCopyName(name: string, counter: number): string {
  return counter === 1 ? `${name} (${COPY_SUFFIX})` : `${name} (${COPY_SUFFIX} ${counter})`;
}

export function canCopyProduct(sourceProduct: ProductCopyAccessInput): boolean {
  return !sourceProduct.parent_product_id;
}

