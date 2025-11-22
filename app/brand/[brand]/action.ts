"use server";

export async function getBrand(brand: string) {
  return { success: true, brand };
}
