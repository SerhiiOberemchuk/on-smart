"use server";

export async function getBrand(brand: string) {
  const logo = "/brands/longse.png";
  return { success: true, brand, logo };
}
