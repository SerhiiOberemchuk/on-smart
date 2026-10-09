import { describe, expect, it, vi } from "vitest";
import { changeCustomerPassword } from "@/app/actions/account/profile/change-password";
vi.mock("@/lib/auth", () => ({ auth: { api: {} } }));
vi.mock("@/db/db", () => ({ db: {} }));

describe("changeCustomerPassword password limit", () => {
  it("rejects an oversized password before auth, database, cookies or mail", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      currentPassword: "current-password",
      newPassword:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      confirmPassword:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    }))
      form.set(key, value);
    const result = await changeCustomerPassword({ success: false, message: null }, form);
    expect(result.success).toBe(false);
    expect(result.message).toBe("La password non può superare 128 caratteri.");
  });
});
