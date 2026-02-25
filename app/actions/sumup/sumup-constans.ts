import { PAGES } from "@/types/pages.types";

export const SUM_UP_CONSTANTS = {
  MERCHANT_CODE: process.env.SUM_UP_MERCHANT_CODE || "",
  ACCESS_TOKEN: process.env.SUM_UP_ACCESS_TOKEN || "",
  API_BASE_URL: "https://api.sumup.com/v0.1/checkouts",
  RETURN_URL: `${process.env.SITE_URL}${PAGES.CHECKOUT_PAGES.COMPLETED}/`,
  REDIRECT_URL: `${process.env.SITE_URL}${PAGES.CHECKOUT_PAGES.COMPLETED}/`,
  SEARCH_PARAM_PROVIDER: { TITLE: "provider", VALUE: "sumup" },
  SEARCH_PARAM_PAYMENT: "payment",
  SEARCH_PARAM_PLACE: "place",
  SEARCH_PARAM_CHECKOUT_ID: { TITLE: "checkout_id" },
};
