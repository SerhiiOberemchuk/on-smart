export type PageType = {
  mainPage: "/" | "/catalogo" | "/carello" | "/categoria" | "/chi-siamo";
  checkoutPages:
    | "/checkout/consegna"
    | "/checkout/informazioni"
    | "/checkout/pagamento"
    | "/checkout/riepilogo"
    | "/checkout/completato";
};

export const PAGES = {
  MAIN_PAGES: {
    HOME: "/",
    CATALOG: "/catalogo",
    CART: "/carello",
    CATEGORY: "/categoria",
    ABOUT_US: "/chi-siamo",
  },
  CHECKOUT_PAGES: {
    DELIVERY: "/checkout/consegna",
    INFORMATION: "/checkout/informazioni",
    PAYMENT: "/checkout/pagamento",
    SUMMARY: "/checkout/riepilogo",
    COMPLETED: "/checkout/completato",
    // PAYMENT_PAGE: {
    //   KLARNA: "/pagamento/klarna",
    //   PAYPAL: "/pagamento/paypal",
    // },
  },
};
