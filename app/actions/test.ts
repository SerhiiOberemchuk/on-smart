"use server";

const apiKey = process.env.ODOO;
const request = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
    // "X-Odoo-Database": "obriym",
  },
  body: JSON.stringify({
    domain: [["display_name", "ilike", "a%"]],
    fields: ["id", "display_name", "list_price", "currency_id", "image_512", "categ_id"],
    limit: 20,
  }),
};
const requestfie = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
    // "X-Odoo-Database": "obriym",
  },
  body: JSON.stringify({
    context: {},
    allfields: null,
    attributes: ["string", "type", "required"],
  }),
};
const BASE_URL = "https://obriym.odoo.com/json/2";

export async function getDataOdoo() {
  try {
    const response = await fetch(BASE_URL + "/product.template/search_read", request);
    if (response.ok) {
      const data = await response.json();
      console.log({ data });
      return data;
    } else {
      console.log(response);
      return "Some error";
    }
  } catch (error) {
    console.log(error);

    return error;
  }
}
export async function getAllFieldsOdoo() {
  try {
    const response = await fetch(BASE_URL + "/product.template/fields_get", requestfie);
    if (response.ok) {
      const data = await response.json();
      console.log({ data });
      return data;
    } else {
      return "Some error";
    }
  } catch (error) {
    console.log(error);

    return error;
  }
}
