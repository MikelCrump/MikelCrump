import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-navy text-cloud">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7 text-cloud" />
            <span className="font-display text-xl tracking-tight">
              Crump <span className="text-blue">Solutions</span> Group
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cloud/65">
            Parent company for learning systems, IT infrastructure, event
            technology, and event management — including CRUMP360 and related
            ventures.
          </p>
          <a
            href="https://crump360.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-bold tracking-wide text-orange hover:underline"
          >
            CRUMP360.com
          </a>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <div className="flex flex-wrap gap-5 font-semibold text-cloud/70">
            <Link className="hover:text-orange" href="/#services">
              Services
            </Link>
            <Link className="hover:text-orange" href="/#trust">
              Credentials
            </Link>
            <Link className="hover:text-orange" href="/#contact">
              Contact
            </Link>
          </div>
          <p className="text-xs font-medium tracking-[0.14em] text-cloud/45 uppercase">
            © {new Date().getFullYear()} Crump Solutions Group · Dallas, TX
          </p>
        </div>
      </div>
    </footer>
  );
}
