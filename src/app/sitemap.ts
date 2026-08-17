import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const staticRoutes = [
  "/",
  "/products",
  "/promo",
  "/login",
  "/register",
  "/forgot-password",
  "/dashboard",
  "/landingpage/bmm-series",
  "/landingpage/chn-series",
  "/landingpage/et-series",
  "/landingpage/env-series",
  "/landingpage/wks-series",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
