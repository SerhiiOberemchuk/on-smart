"use client";

import { getAllFieldsOdoo, getDataOdoo } from "@/app/actions/test";
import ButtonYellow from "@/components/BattonYellow";
import { useState } from "react";
import ButtonXDellete from "../ButtonXDellete";
import { deleteProductSpecificheById } from "@/app/actions/product-specifiche/delete-product-specifiche";

export default function OrderPage() {
  const [state, setState] = useState("Initial state");
  const handle = async () => {
    const res = await getDataOdoo();
    console.log({ res });

    setState(res);
  };
  return (
    <div>
      <ButtonYellow type="button" onClick={handle}>
        Fetch odoo product
      </ButtonYellow>
      <ButtonYellow type="button" onClick={async () => await getAllFieldsOdoo()}>
        Get all product fields
      </ButtonYellow>
      <ButtonXDellete onClick={() => setState("Initial state")} />
      <div className="bg-blue-500 p-5">{String(state)}</div>

      <ButtonYellow onClick={async () => deleteProductSpecificheById("01KBTG43GB9WCT2BYA6AHHJEQ5")}>
        Видалити галерею
      </ButtonYellow>
    </div>
  );
}
