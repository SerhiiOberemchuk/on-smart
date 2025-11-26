"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product-schema";

export async function addNewProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const brand = formData.get("brand") as string;
  const category = formData.get("category") as string;
  const inStock = parseInt(formData.get("inStock") as string, 10);
  const imgSrc = formData.get("imgSrc") as string;
  const product = { name, description, price, brand, category, inStock, imgSrc };
  const res = await db.insert(productsSchema).values(product);
  console.log({ res });
}
