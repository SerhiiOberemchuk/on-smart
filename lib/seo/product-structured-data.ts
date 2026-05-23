import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import type { ProductType } from "@/db/schemas/product.schema";
import { DELIVERY_DATA } from "@/types/delivery.data";
import type {
  MerchantReturnPolicy,
  Offer,
  OfferShippingDetails,
  Product,
  UnitPriceSpecification,
} from "schema-dts";

function toPositiveNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function getShippingPrice(offerPrice: number) {
  if (offerPrice >= DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE) {
    return 0;
  }

  return DELIVERY_DATA.PRISE_DELIVERY;
}

export function buildOfferShippingDetails(offerPrice: number): OfferShippingDetails {
  const shippingPrice = getShippingPrice(offerPrice);

  return {
    "@type": "OfferShippingDetails",
    shippingLabel:
      shippingPrice === 0 ? DELIVERY_DATA.FREE_SHIPPING_LABEL : DELIVERY_DATA.SHIPPING_LABEL,
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: DELIVERY_DATA.COUNTRY,
    },
    shippingOrigin: {
      "@type": "DefinedRegion",
      addressCountry: CONTACTS_ADDRESS.ADDRESS.COUNTRY,
      addressRegion: CONTACTS_ADDRESS.ADDRESS.REGION,
      postalCode: CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE,
    },
    shippingRate: {
      "@type": "MonetaryAmount",
      value: shippingPrice,
      currency: "EUR",
    },
    shippingSettingsLink: `${CONTACTS_ADDRESS.BASE_URL}${DELIVERY_DATA.SHIPPING_SETTINGS_PATH}`,
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: DELIVERY_DATA.HANDLING_TIME_DAYS.MIN,
        maxValue: DELIVERY_DATA.HANDLING_TIME_DAYS.MAX,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: DELIVERY_DATA.TRANSIT_TIME_DAYS.MIN,
        maxValue: DELIVERY_DATA.TRANSIT_TIME_DAYS.MAX,
        unitCode: "DAY",
      },
    },
    transitTimeLabel: "Consegna media 24/48 ore; fino a 72 ore per zone remote.",
  } satisfies OfferShippingDetails;
}

export function buildMerchantReturnPolicy(): MerchantReturnPolicy {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": `${CONTACTS_ADDRESS.BASE_URL}${DELIVERY_DATA.RETURN_POLICY_PATH}#return-policy`,
    applicableCountry: DELIVERY_DATA.COUNTRY,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: DELIVERY_DATA.RETURN_DAYS,
    returnPolicyCountry: DELIVERY_DATA.COUNTRY,
    returnMethod: "https://schema.org/ReturnByMail",
    returnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    customerRemorseReturnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    customerRemorseReturnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",
    itemDefectReturnFees: "https://schema.org/FreeReturn",
    itemCondition: "https://schema.org/NewCondition",
    merchantReturnLink: `${CONTACTS_ADDRESS.BASE_URL}${DELIVERY_DATA.RETURN_POLICY_PATH}`,
  } satisfies MerchantReturnPolicy;
}

export function buildProductPhysicalProperties(
  product: Pick<ProductType, "lengthCm" | "widthCm" | "heightCm" | "weightKg">,
): Pick<Product, "depth" | "height" | "weight" | "width"> {
  const lengthCm = toPositiveNumber(product.lengthCm);
  const widthCm = toPositiveNumber(product.widthCm);
  const heightCm = toPositiveNumber(product.heightCm);
  const weightKg = toPositiveNumber(product.weightKg);

  return {
    ...(lengthCm
      ? {
          depth: {
            "@type": "QuantitativeValue",
            value: lengthCm,
            unitCode: "CMT",
            unitText: "cm",
          },
        }
      : {}),
    ...(widthCm
      ? {
          width: {
            "@type": "QuantitativeValue",
            value: widthCm,
            unitCode: "CMT",
            unitText: "cm",
          },
        }
      : {}),
    ...(heightCm
      ? {
          height: {
            "@type": "QuantitativeValue",
            value: heightCm,
            unitCode: "CMT",
            unitText: "cm",
          },
        }
      : {}),
    ...(weightKg
      ? {
          weight: {
            "@type": "QuantitativeValue",
            value: weightKg,
            unitCode: "KGM",
            unitText: "kg",
          },
        }
      : {}),
  } satisfies Pick<Product, "depth" | "height" | "weight" | "width">;
}

export function buildOfferPriceSpecification({
  currentPrice,
  oldPrice,
}: {
  currentPrice: unknown;
  oldPrice: unknown;
}): Pick<Offer, "priceSpecification"> {
  const current = toPositiveNumber(currentPrice);
  const old = toPositiveNumber(oldPrice);

  if (!current || !old || old <= current) {
    return {};
  }

  return {
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: old,
      priceCurrency: "EUR",
      priceType: "https://schema.org/StrikethroughPrice",
    } satisfies UnitPriceSpecification,
  } satisfies Pick<Offer, "priceSpecification">;
}

export function buildOfferShippingAndReturnPolicy(
  offerPrice: number,
): Pick<Offer, "shippingDetails" | "hasMerchantReturnPolicy"> {
  return {
    shippingDetails: buildOfferShippingDetails(offerPrice),
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
  } satisfies Pick<Offer, "shippingDetails" | "hasMerchantReturnPolicy">;
}
