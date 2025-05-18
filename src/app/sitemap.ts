import { MetadataRoute } from "next";

// Define your base URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://musclefitness.com";

// Define the languages you support
const languages = ["en", "am"];

// Define the routes that should be included in the sitemap
const routes = ["/", "/about", "/services", "/contact", "/Shop"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Create an array to hold all the sitemap entries
  const sitemap: MetadataRoute.Sitemap = [];

  // Add each route for each language
  for (const lang of languages) {
    for (const route of routes) {
      const path = lang === "en" ? route : `/${lang}${route}`;

      sitemap.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "/" ? 1.0 : 0.8,
      });
    }
  }

  return sitemap;
}
