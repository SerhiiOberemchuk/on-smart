import { PHASE_PRODUCTION_BUILD } from "next/constants";

export function isProductionBuild() {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}
