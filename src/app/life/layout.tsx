import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./life.css";

const inter = Inter({
  variable: "--font-life-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life Ops · Mikel Crump",
  description:
    "Personal operations board for home, Tesla, finance, health, AI credits, and media.",
};

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return (
    // One typeface everywhere: --font-life-display points at Inter too.
    <div
      className={`${inter.variable} min-h-full font-[family-name:var(--font-life-sans)] [--font-life-display:var(--font-life-sans)]`}
    >
      {children}
    </div>
  );
}
