import { getOrderFullInfoById } from "@/app/actions/admin/orders/queries";
import { Suspense } from "react";
import PageOrderByID from "./PageOrderByIDClient";
import Spiner from "@/components/Spiner";

export default async function PAge(params: PageProps<"/admin/dashboard/orders/[id]">) {
  const id = (await params.params).id;
  const orderInfoAction = getOrderFullInfoById({ id });
  return (
    <Suspense fallback={<Spiner />}>
      <PageOrderByID orderInfoAction={orderInfoAction} />
    </Suspense>
  );
}
