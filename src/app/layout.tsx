import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { AuthGate } from "@/components/steward/auth-gate";
import { StewardShell } from "@/components/steward/shell";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Steward — Private Life Dashboard",
  description:
    "Mikel’s private command center for money, health, calendar, Tesla, and more.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-ink">
        <AuthGate>
          <StewardShell>{children}</StewardShell>
        </AuthGate>
      </body>
    </html>
  );
}
