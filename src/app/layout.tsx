import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Crump Solutions Group",
    template: "%s · Crump Solutions Group",
  },
  description:
    "LMS engineering, IT infrastructure, event technology, and event management — more than 40 years of combined professional experience under one trusted group.",
  openGraph: {
    title: "Crump Solutions Group",
    description:
      "Professional services spanning learning systems, Microsoft & identity infrastructure, Cvent event technology, and end-to-end event management.",
    siteName: "Crump Solutions Group",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
