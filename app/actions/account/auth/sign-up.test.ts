import { describe, expect, it, vi } from "vitest";
import { createCustomerAccount } from "@/app/actions/account/auth/sign-up";
vi.mock("@/lib/auth", () => ({ auth: { api: {} } }));
vi.mock("@/db/db", () => ({ db: {} }));

describe("createCustomerAccount password limit", () => {
  it("rejects an oversized password before auth, database, cookies or mail", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      name: "Buyer",
      email: "buyer@example.com",
      password:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      confirmPassword:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    }))
      form.set(key, value);
    const result = await createCustomerAccount(
      { success: false, errorCode: null, errorMessage: null },
      form,
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("La password non può superare 128 caratteri.");
  });
});
