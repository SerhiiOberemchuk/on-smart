import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

export function isBuildPhase() {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}
