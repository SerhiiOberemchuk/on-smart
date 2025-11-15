export function parseSlugWithId(slugId: string) {
  const parts = slugId.split("-");
  const id = parts.pop();
  const slug = parts.join("-");
  return { slug, id };
}
