import slugify from "@sindresorhus/slugify";

export function toSlug(str: string) {
  return slugify(str, {
    locale: "it",
  });
}
