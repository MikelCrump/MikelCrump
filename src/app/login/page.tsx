import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../life/life.css";

const inter = Inter({ variable: "--font-life-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sign in · Mikel Crump",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  invalid: "That email and password don't match.",
  config: "Sign-in isn't set up yet. Run pnpm auth:set-password, then redeploy.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Couldn't sign in.") : null;

  return (
    <div
      className={`${inter.variable} life-root flex items-center justify-center px-4 py-10`}
      // Inline so it beats .life-root's min-height; dvh tracks mobile browser toolbars.
      style={{ minHeight: "100dvh" }}
    >
      <main className="w-full max-w-sm">
        <h1 className="text-[22px] font-semibold text-[var(--life-ink)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--life-muted)]">Mikel Crump · private</p>

        <form method="post" action="/api/auth/login" className="life-panel mt-6 space-y-4">
          <input type="hidden" name="next" value={next ?? "/life"} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              className="life-input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="life-input"
            />
          </label>
          {message ? (
            <p role="alert" className="text-[13px] text-[#b42318]">
              {message}
            </p>
          ) : null}
          <button type="submit" className="life-btn life-btn-on h-10 w-full">
            Sign in
          </button>
        </form>
      </main>
    </div>
  );
}
