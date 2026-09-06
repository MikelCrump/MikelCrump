import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { TabletChrome } from "@/components/arrival/tablet-chrome";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Northstar Arrival",
    template: "%s · Northstar Arrival",
  },
  description:
    "Tablet-first onsite check-in for Northstar — registrations, QR scanning, kiosk mode, templates, and live event stats.",
  appleWebApp: {
    capable: true,
    title: "Northstar Arrival",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1b6b6e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TabletChrome>{children}</TabletChrome>
      </body>
    </html>
  );
}
