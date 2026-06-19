import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://daily-davar.vercel.app",         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: "https://daily-davar.vercel.app/pricing",  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://daily-davar.vercel.app/terms",    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: "https://daily-davar.vercel.app/privacy",  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
