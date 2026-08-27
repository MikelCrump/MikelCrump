/** Local UI preview when Supabase is not configured yet. */
export const PREVIEW_SESSION_KEY = "steward-preview-session";

export function hasPreviewSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === "1";
}

export function startPreviewSession() {
  window.sessionStorage.setItem(PREVIEW_SESSION_KEY, "1");
}

export function clearPreviewSession() {
  window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
}
