import { permanentRedirect } from "next/navigation";

export default function NotFoundCatchAllPage() {
  permanentRedirect("/");
}
