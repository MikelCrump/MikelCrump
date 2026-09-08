import { format, formatDistanceToNow, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventRange(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  const sameDay = format(s, "yyyy-MM-dd") === format(e, "yyyy-MM-dd");
  if (sameDay) {
    return `${format(s, "MMM d, yyyy")} · ${format(s, "h:mm a")} – ${format(e, "h:mm a")}`;
  }
  return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function formatPrice(price: number) {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function seatsLeft(capacity: number, registered: number) {
  return Math.max(capacity - registered, 0);
}
