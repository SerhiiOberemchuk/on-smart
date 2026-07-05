"use server";

import { customerProfilesSchema, type CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function getCustomerProfile(): Promise<CustomerProfileType | null> {
  const session = await requireCustomerSession();

  try {
    const [profile] = await db
      .select()
      .from(customerProfilesSchema)
      .where(eq(customerProfilesSchema.userId, session.user.id))
      .limit(1);

    return profile ?? null;
  } catch (error) {
    console.error("[getCustomerProfile]", error);
    return null;
  }
}
