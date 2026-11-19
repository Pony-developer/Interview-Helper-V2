import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Assay — mock technical interviews",
    short_name: "Assay",
    description: "Adaptive mock interviews with quizzes and live coding tasks.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#0b5a43",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
