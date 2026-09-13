/** Marketing site lives under /crump360 (served at crumpusa.org/crump360). */
export const MARKETING_BASE = "/crump360";

/** Product conversion path on crump360.com */
export const PRODUCT_START = "/start";

export const PRODUCT_ORIGIN =
  process.env.NEXT_PUBLIC_PRODUCT_ORIGIN ?? "https://crump360.com";

export const MARKETING_ORIGIN =
  process.env.NEXT_PUBLIC_MARKETING_ORIGIN ?? "https://crumpusa.org";

export function marketingPath(path = ""): string {
  if (!path || path === "/") return MARKETING_BASE;
  return `${MARKETING_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** CTA into the product. Uses absolute origin when configured for cross-domain. */
export function productStartUrl(): string {
  if (process.env.NEXT_PUBLIC_PRODUCT_ORIGIN) {
    return `${process.env.NEXT_PUBLIC_PRODUCT_ORIGIN}${PRODUCT_START}`;
  }
  // Same deploy (local / shared project): relative path.
  return PRODUCT_START;
}

export function marketingHomeUrl(): string {
  if (process.env.NEXT_PUBLIC_MARKETING_ORIGIN) {
    return `${process.env.NEXT_PUBLIC_MARKETING_ORIGIN}${MARKETING_BASE}`;
  }
  return MARKETING_BASE;
}
