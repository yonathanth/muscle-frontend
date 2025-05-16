import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://robifitness.com";
  const locales = ["en", "am"]; // Add your supported locales
  const pages = ["", "/about", "/Contact", "/Register"];

  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date().toISOString(),
    }))
  );
}
