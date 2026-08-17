const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || LOCAL_SITE_URL;

  return normalizeSiteUrl(siteUrl);
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}
