import { describe, expect, it, vi } from "vitest";

import {
  PRODUCT_SAVE_ALL_ACTIVITY_EVENT,
  PRODUCT_SAVE_ALL_EVENT,
  PRODUCT_SAVE_ALL_RESULT_EVENT,
  reportProductSaveAllActivity,
  reportProductSaveAllResult,
  runProductSaveAll,
} from "./save-all.helpers";

describe("save-all helpers", () => {
  it("emits product save-all event and submits form", () => {
    const emit = vi.fn();
    const submit = vi.fn();

    runProductSaveAll({ emit, submit });

    expect(emit).toHaveBeenCalledWith(PRODUCT_SAVE_ALL_EVENT);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("emits save-all activity event with delta", () => {
    const emit = vi.fn();

    reportProductSaveAllActivity({ emit, delta: 1 });

    expect(emit).toHaveBeenCalledWith(PRODUCT_SAVE_ALL_ACTIVITY_EVENT, { delta: 1 });
  });

  it("emits save-all result event", () => {
    const emit = vi.fn();

    reportProductSaveAllResult({
      emit,
      status: "error",
      message: "Помилка оновлення",
    });

    expect(emit).toHaveBeenCalledWith(PRODUCT_SAVE_ALL_RESULT_EVENT, {
      status: "error",
      message: "Помилка оновлення",
    });
  });
});
