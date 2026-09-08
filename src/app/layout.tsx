import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
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
  metadataBase: new URL("https://crump360.com"),
  title: {
    default: "CRUMP360 — Events & Learning",
    template: "%s · CRUMP360",
  },
  description:
    "CRUMP360 is an events management and LMS platform that keeps gatherings and courses on one learning path.",
  openGraph: {
    siteName: "CRUMP360",
    url: "https://crump360.com",
  },
  icons: {
    icon: [
      { url: "/brand/crump360-mark.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/brand/crump360-mark.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
