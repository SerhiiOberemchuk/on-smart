import { describe, expect, it } from "vitest";

import { getBundleSaveButtonState } from "./bundle-save.helpers";

describe("bundle save button state", () => {
  it("returns disabled state while bundle update is pending", () => {
    const state = getBundleSaveButtonState(true, 0);

    expect(state).toEqual({
      isDisabled: true,
      label: "Оновлення...",
    });
  });

  it("returns disabled state while document is uploading", () => {
    const state = getBundleSaveButtonState(false, 2);

    expect(state).toEqual({
      isDisabled: true,
      label: "Зберегти все",
    });
  });

  it("returns enabled save-all state when ready", () => {
    const state = getBundleSaveButtonState(false, 0);

    expect(state).toEqual({
      isDisabled: false,
      label: "Зберегти все",
    });
  });
});

