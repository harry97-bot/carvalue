import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CARVALUE · 내 차의 가치를 찾다",
    short_name: "CARVALUE",
    description: "내 차 시세, 자동차 A/B 투표, 커뮤니티를 한 곳에서. CARVALUE",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ko",
    background_color: "#f7f8fa",
    theme_color: "#f7f8fa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
