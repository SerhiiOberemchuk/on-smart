import { describe, expect, it } from "vitest";
import { getErrorRecord, serializeDatabaseError } from "@/lib/serialize-database-error";

describe("serializeDatabaseError", () => {
  it("keeps non-enumerable Error fields and nested driver diagnostics", () => {
    const driver = Object.assign(new Error("Connection refused"), {
      code: "ECONNREFUSED",
      sqlMessage: "Unavailable",
    });
    const result = serializeDatabaseError(new Error("Query failed", { cause: driver }));
    expect(result.base.message).toBe("Query failed");
    expect(result.cause?.code).toBe("ECONNREFUSED");
    expect(result.cause?.sqlMessage).toBe("Unavailable");
  });
  it("handles non-object throws and circular driver errors", () => {
    expect(getErrorRecord(null)).toEqual({});
    expect(getErrorRecord("failure")).toEqual({});
    const error: Record<string, unknown> = { code: "DB_ERROR" };
    error.original = error;
    const result = serializeDatabaseError(error);
    expect(result.enumerable).toBeNull();
    expect(result.original?.code).toBe("DB_ERROR");
  });
});
