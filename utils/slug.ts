import slugify from "slugify";

export function toSlug(str: string) {
  return slugify(str, {
    lower: true,
    strict: true,
    locale: "it",
    trim: true,
  });
}
