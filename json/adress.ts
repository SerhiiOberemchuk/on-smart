import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";

export const address = {
  "@type": "PostalAddress",
  streetAddress: CONTACTS_ADDRESS.ADDRESS.STREET,
  addressLocality: CONTACTS_ADDRESS.ADDRESS.CITY,
  postalCode: CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE,
  addressRegion: CONTACTS_ADDRESS.ADDRESS.REGION,
  addressCountry: CONTACTS_ADDRESS.ADDRESS.COUNTRY,
};
