/** Only this account may access Steward. */
export const ALLOWED_EMAIL = "MikelCrump611@gmail.com";

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ALLOWED_EMAIL.toLowerCase();
}

export const OWNER_DISPLAY_NAME = "Mikel";
