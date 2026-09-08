import { SiteAnnouncement } from "@/components/layout/site-announcement";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <SiteAnnouncement />
      <div className="border-b border-line bg-surface/90 backdrop-blur-md">
        <SiteHeader variant="app" />
      </div>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
