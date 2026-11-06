import type { MetadataRoute } from "next";

function obtenerUrlSitio(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicita) return explicita.replace(/\/+$/, "");

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (host) {
    return `https://${host.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = obtenerUrlSitio();
  const ahora = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/simulador`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/postular`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
