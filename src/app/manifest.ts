import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard/overview",
    name: "Granny May's Ledger",
    short_name: "Granny May's",
    description: "A backward- and forward-looking household ledger.",
    start_url: "/dashboard/overview",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#1c2b39",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Quick add",
        short_name: "Quick add",
        description: "Log a purchase in a few seconds",
        url: "/quick-add",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
