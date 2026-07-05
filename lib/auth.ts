import "../envConfig";
// import "dotenv/config";
import { account, session, user, verification } from "@/auth-schema";
import { db } from "@/db/db";
import { sendAuthMail } from "@/lib/auth-mail";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { user, account, session, verification },
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    // Mandatory email verification for everyone, admins included (spec decision #16).
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthMail("reset-password", { to: user.email, url, name: user.name });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24h
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthMail("verify-email", { to: user.email, url, name: user.name });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh expiry at most once per day
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },

  plugins: [ admin(),nextCookies(),],
  secret: process.env.BETTER_AUTH_SECRET!,
});
