import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line/80 bg-gradient-to-b from-mist/80 to-paper">
        <SiteHeader variant="app" />
      </div>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
