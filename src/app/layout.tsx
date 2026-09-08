import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { TabletChrome } from "@/components/arrival/tablet-chrome";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CRUMP360 Arrival",
    template: "%s · CRUMP360 Arrival",
  },
  description:
    "Tablet-first onsite check-in for CRUMP360 — registrations, QR scanning, kiosk mode, templates, and live event stats.",
  appleWebApp: {
    capable: true,
    title: "CRUMP360 Arrival",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2e41de",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TabletChrome>{children}</TabletChrome>
      </body>
    </html>
  );
}
