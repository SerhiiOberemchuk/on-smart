import { describe, expect, it, vi } from "vitest";
import { signInCustomer } from "@/app/actions/account/auth/sign-in";
vi.mock("@/lib/auth", () => ({ auth: { api: {} } }));
vi.mock("@/db/db", () => ({ db: {} }));

describe("signInCustomer password limit", () => {
  it("rejects an oversized password before auth, database, cookies or mail", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      email: "buyer@example.com",
      password:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    }))
      form.set(key, value);
    const result = await signInCustomer(
      { success: false, errorCode: null, errorMessage: null },
      form,
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("La password non può superare 128 caratteri.");
  });
});
