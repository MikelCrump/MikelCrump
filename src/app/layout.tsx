import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { AppProvider } from "@/components/providers/app-provider";
import { CommandCenterAuthBridge } from "@/components/auth/command-center-auth-bridge";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TableFlow — Spreadsheet Database & Forms",
  description:
    "Create bases, manage data like Airtable, and embed forms on your website.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CommandCenterAuthBridge>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </CommandCenterAuthBridge>
      </body>
    </html>
  );
}
