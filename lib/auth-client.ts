import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Same-origin by default — no hardcoded baseURL (was "http://localhost:3000").
  plugins: [adminClient()],
});
