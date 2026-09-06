import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-bg min-h-screen">
      <div className="constellation min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
