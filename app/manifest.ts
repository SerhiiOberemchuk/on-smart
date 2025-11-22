import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "On Smart",
    short_name: "On Smart",
    description:
      "La videosorveglianza è uno dei modi più affidabili per proteggere la tua proprietà",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
