import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Clarity from "@microsoft/clarity";
import MicrosoftClarity from "./MicrosoftClarity";

const { lifecycle } = vi.hoisted(() => ({
  lifecycle: { cleanup: undefined as (() => void) | undefined },
}));

vi.mock("react", () => ({
  useEffect: (effect: () => () => void) => {
    lifecycle.cleanup = effect();
  },
}));
vi.mock("@microsoft/clarity", () => ({
  default: { init: vi.fn(), consentV2: vi.fn() },
}));
vi.mock("@/components/cookie-consent/constants", () => ({
  COOKIE_CONSENT_STORAGE_KEY: "on-smart-cookie-consent",
  COOKIE_CONSENT_CHANGED_EVENT: "on-smart:cookie-consent-changed",
}));

const getItem = vi.fn();
let browser: EventTarget;

function changeConsent(value: string) {
  getItem.mockReturnValue(value);
  browser.dispatchEvent(new Event("on-smart:cookie-consent-changed"));
}

describe("Microsoft Clarity consent integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    browser = new EventTarget();
    vi.stubGlobal("window", browser);
    vi.stubGlobal("localStorage", { getItem });
    getItem.mockReturnValue(null);
  });

  afterEach(() => {
    lifecycle.cleanup?.();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([null, "rejected", "invalid"])("does not load for consent %s", (consent) => {
    getItem.mockReturnValue(consent);
    MicrosoftClarity();
    expect(Clarity.init).not.toHaveBeenCalled();
    expect(Clarity.consentV2).not.toHaveBeenCalled();
  });

  it("loads the requested project for saved consent and denies ad storage", () => {
    getItem.mockReturnValue("accepted");
    MicrosoftClarity();
    expect(Clarity.init).toHaveBeenCalledWith("yf44pg3x6f");
    expect(Clarity.consentV2).toHaveBeenCalledWith({
      ad_Storage: "denied",
      analytics_Storage: "granted",
    });
  });

  it("handles acceptance, revocation and reacceptance without reinitializing", () => {
    MicrosoftClarity();
    changeConsent("accepted");
    changeConsent("rejected");
    expect(Clarity.consentV2).toHaveBeenLastCalledWith({
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    changeConsent("accepted");
    expect(Clarity.init).toHaveBeenCalledTimes(1);
    expect(Clarity.consentV2).toHaveBeenLastCalledWith({
      ad_Storage: "denied",
      analytics_Storage: "granted",
    });
  });

  it("syncs consent changes and storage clearing from another tab", () => {
    getItem.mockReturnValue("accepted");
    MicrosoftClarity();
    getItem.mockReturnValue("rejected");
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: "on-smart-cookie-consent" });
    browser.dispatchEvent(event);
    expect(Clarity.consentV2).toHaveBeenLastCalledWith({
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    getItem.mockReturnValue(null);
    const cleared = new Event("storage");
    Object.defineProperty(cleared, "key", { value: null });
    browser.dispatchEvent(cleared);
    expect(Clarity.consentV2).toHaveBeenCalledTimes(3);
  });

  it("removes event listeners on unmount", () => {
    MicrosoftClarity();
    lifecycle.cleanup?.();
    changeConsent("accepted");
    expect(Clarity.init).not.toHaveBeenCalled();
  });

  it("does not break the page when browser storage is unavailable", () => {
    getItem.mockImplementationOnce(() => {
      throw new Error("Storage blocked");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => MicrosoftClarity()).not.toThrow();
    expect(Clarity.init).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledOnce();
  });
});
