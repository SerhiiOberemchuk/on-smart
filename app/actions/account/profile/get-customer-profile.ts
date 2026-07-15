"use server";

import { customerProfilesSchema, type CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import { db } from "@/db/db";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { requireCustomerSession } from "../_shared/require-customer-session";

// Cached per user so that any server component reading the profile (checkout,
// cart, profile page) shares one cache entry, invalidated by tag on save.
async function readCustomerProfile(userId: string): Promise<CustomerProfileType | null> {
  "use cache";
  cacheTag(CACHE_TAGS.customerProfile.byUser(userId));
  cacheLife("hours");

  try {
    const [profile] = await db
      .select()
      .from(customerProfilesSchema)
      .where(eq(customerProfilesSchema.userId, userId))
      .limit(1);

    return profile ?? null;
  } catch (error) {
    console.error("[getCustomerProfile]", error);
    return null;
  }
}

export async function getCustomerProfile(): Promise<CustomerProfileType | null> {
  const session = await requireCustomerSession();
  return readCustomerProfile(session.user.id);
}
