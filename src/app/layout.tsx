import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { CommandCenterAuthBridge } from "@/components/auth/command-center-auth-bridge";
import { CommandCenterThemeSync } from "@/components/auth/command-center-theme-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${brand.legalName} — Communications`,
  description:
    "Schedule email and SMS for Reawaken USA. Brevo, Twilio, and Command Center CRM.",
  icons: {
    icon: brand.logoPath,
    apple: brand.logoPath,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CommandCenterThemeSync />
        <CommandCenterAuthBridge>{children}</CommandCenterAuthBridge>
      </body>
    </html>
  );
}
