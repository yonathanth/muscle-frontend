import { MetadataRoute } from "next";

// Define your base URL
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://musclefitnesscenter.com";

// Define the routes that should be included in the sitemap
const routes = ["/", "/about", "/services", "/contact", "/Shop"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Create an array to hold all the sitemap entries
  const sitemap: MetadataRoute.Sitemap = [];

  // Add each route with /en prefix
  for (const route of routes) {
    sitemap.push({
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "/" ? 1.0 : 0.8,
    });
  }

  return sitemap;
}
