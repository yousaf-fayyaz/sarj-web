import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["https://sarj.sa", "https://sarj.sa/ar"].map(url => ({ url, alternates: { languages: { en: "https://sarj.sa", ar: "https://sarj.sa/ar" } } }));
}
