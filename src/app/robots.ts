import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const locales = ["am", "en"]; // Your supported locales
  const disallowedPaths = ["/user", "/admin"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: locales.flatMap((locale) =>
          disallowedPaths.map((path) => `/${locale}${path}`)
        ),
      },
    ],
    sitemap: "https://robifitness.com/sitemap.xml",
  };
}
