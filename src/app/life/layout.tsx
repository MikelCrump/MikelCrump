import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./life.css";

const dmSans = DM_Sans({
  variable: "--font-life-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-life-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life Ops · Mikel Crump",
  description:
    "Personal operations board for home, Tesla, finance, health, AI credits, and media.",
};

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${syne.variable} min-h-full font-[family-name:var(--font-life-sans)]`}>
      {children}
    </div>
  );
}
