/** Prefix API paths with NEXT_PUBLIC_BASE_PATH when Tables is mounted under Command Center. */
export function apiPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
