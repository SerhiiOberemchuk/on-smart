export function createConstatObjFromEnumArray<T extends readonly string[]>(
  arr: T,
): { [K in T[number]]: K } {
  return Object.fromEntries(arr.map((v) => [v, v])) as {
    [K in T[number]]: K;
  };
}
