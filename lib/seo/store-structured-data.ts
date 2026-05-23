import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { DELIVERY_DATA } from "@/types/delivery.data";
import type { OnlineStore, ShippingService, WithContext } from "schema-dts";
import { buildMerchantReturnPolicy } from "./product-structured-data";

export function buildStoreShippingService(): ShippingService {
  const shippingOrigin = {
    "@type": "DefinedRegion",
    addressCountry: CONTACTS_ADDRESS.ADDRESS.COUNTRY,
    addressRegion: CONTACTS_ADDRESS.ADDRESS.REGION,
    postalCode: CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE,
  } as const;
  const shippingDestination = {
    "@type": "DefinedRegion",
    addressCountry: DELIVERY_DATA.COUNTRY,
  } as const;
  const transitTime = {
    "@type": "QuantitativeValue",
    minValue: DELIVERY_DATA.TRANSIT_TIME_DAYS.MIN,
    maxValue: DELIVERY_DATA.TRANSIT_TIME_DAYS.MAX,
    unitCode: "DAY",
  } as const;

  return {
    "@type": "ShippingService",
    "@id": `${CONTACTS_ADDRESS.BASE_URL}${DELIVERY_DATA.SHIPPING_SETTINGS_PATH}#shipping-service`,
    name: "Spedizione standard in Italia",
    description:
      "Spedizione in Italia con costo fisso e spedizione gratuita oltre la soglia indicata.",
    fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
    shippingConditions: [
      {
        "@type": "ShippingConditions",
        shippingOrigin,
        shippingDestination,
        orderValue: {
          "@type": "MonetaryAmount",
          minValue: 0,
          maxValue: DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE - 0.01,
          currency: "EUR",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: DELIVERY_DATA.PRISE_DELIVERY,
          currency: "EUR",
        },
        transitTime,
      },
      {
        "@type": "ShippingConditions",
        shippingOrigin,
        shippingDestination,
        orderValue: {
          "@type": "MonetaryAmount",
          minValue: DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE,
          currency: "EUR",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "EUR",
        },
        transitTime,
      },
    ],
  } satisfies ShippingService;
}

export function buildOnlineStoreJsonLd(): WithContext<OnlineStore> {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "OnSmart",
    alternateName: "On Smart",
    description: "E-commerce di elettronica, videosorveglianza e smart home per casa e azienda.",
    legalName: CONTACTS_ADDRESS.OWNER.COMPANY_NAME,
    url: CONTACTS_ADDRESS.BASE_URL,
    logo: `${CONTACTS_ADDRESS.BASE_URL}/logo.png`,
    email: CONTACTS_ADDRESS.EMAIL,
    telephone: CONTACTS_ADDRESS.PHONE_NUMBER,
    vatID: CONTACTS_ADDRESS.OWNER.VAT_NUMBER,
    taxID: CONTACTS_ADDRESS.OWNER.VAT_NUMBER,
    sameAs: ["https://www.facebook.com/onsmart", "https://www.instagram.com/onsmart"],
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACTS_ADDRESS.ADDRESS.STREET,
      addressLocality: CONTACTS_ADDRESS.ADDRESS.CITY,
      addressRegion: CONTACTS_ADDRESS.ADDRESS.REGION,
      postalCode: CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE,
      addressCountry: CONTACTS_ADDRESS.ADDRESS.COUNTRY,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACTS_ADDRESS.PHONE_NUMBER,
      email: CONTACTS_ADDRESS.EMAIL,
      contactType: "customer service",
      availableLanguage: "Italian",
    },
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
    hasShippingService: buildStoreShippingService(),
  } satisfies WithContext<OnlineStore>;
}
