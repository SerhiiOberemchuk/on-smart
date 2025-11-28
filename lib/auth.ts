import { account, session, user, verification } from "@/auth-schema";
import { db } from "@/db/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { user, account, session, verification },
  }),

  emailAndPassword: {
    enabled: true,
    //  requireEmailVerification: true
  },
  plugins: [nextCookies(), admin()],
});
