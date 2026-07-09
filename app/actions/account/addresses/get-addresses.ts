"use server";

import { userAddressesSchema, type UserAddressType } from "@/db/schemas/user-addresses.schema";
import { db } from "@/db/db";
import { desc, eq } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function getAddresses(): Promise<UserAddressType[]> {
  const session = await requireCustomerSession();

  try {
    return await db
      .select()
      .from(userAddressesSchema)
      .where(eq(userAddressesSchema.userId, session.user.id))
      .orderBy(desc(userAddressesSchema.createdAt));
  } catch (error) {
    console.error("[getAddresses]", error);
    return [];
  }
}
