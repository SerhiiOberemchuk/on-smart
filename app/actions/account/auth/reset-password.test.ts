import { describe, expect, it, vi } from "vitest";
import { resetCustomerPassword } from "@/app/actions/account/auth/reset-password";
vi.mock("@/lib/auth", () => ({ auth: { api: {} } }));
vi.mock("@/db/db", () => ({ db: {} }));

describe("resetCustomerPassword password limit", () => {
  it("rejects an oversized password before auth, database, cookies or mail", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      password:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      confirmPassword:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      token: "valid-token",
    }))
      form.set(key, value);
    const result = await resetCustomerPassword(
      { success: false, errorCode: null, errorMessage: null },
      form,
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("La password non può superare 128 caratteri.");
  });
});
