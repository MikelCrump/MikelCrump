"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Database, Loader2 } from "lucide-react";
import { tryCreateClient } from "@/lib/supabase/client";
import { syncCommandCenterSession } from "@/lib/supabase/auth-bridge";
import { getAppUrl, isSupabaseConfigured } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const synced = await syncCommandCenterSession();
      if (!cancelled && synced) {
        router.replace(redirect);
        router.refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [redirect, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Supabase is not configured. Using local mode.");
      router.push("/");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setGoogleLoading(false);
      return;
    }

    const base = getAppUrl().replace(/\/$/, "");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/auth/callback?next=${encodeURIComponent(redirect)}`,
        queryParams: {
          hd: "reawakenusa.org",
          prompt: "select_account",
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Tables · Reawaken Command Center
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mb-4 w-full"
        disabled={googleLoading || loading}
        onClick={handleGoogle}
      >
        {googleLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          "Continue with Google"
        )}
      </Button>

      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or email
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@reawakenusa.org"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <Database className="mx-auto mb-4 h-10 w-10 text-blue-600" />
          <h1 className="text-xl font-bold text-foreground">Local mode</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured. Tables is running with browser
            storage. Add your env vars to enable cloud sync.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/">Continue to app</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
