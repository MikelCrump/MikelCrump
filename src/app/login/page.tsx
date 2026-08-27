"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fingerprint,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { ALLOWED_EMAIL } from "@/lib/auth-allowlist";
import { getAppUrl, isSupabaseConfigured } from "@/lib/config";
import { tryCreateClient } from "@/lib/supabase/client";
import {
  hasPreviewSession,
  startPreviewSession,
} from "@/lib/preview-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "choose" | "totp" | "passkey-enroll";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const errorParam = searchParams.get("error");

  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "auth"
      ? "Sign-in failed. Try again."
      : errorParam === "forbidden"
        ? "This account is not authorized for Steward."
        : ""
  );
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (hasPreviewSession()) {
      router.replace(redirect);
    }
  }, [redirect, router]);

  const enterPreview = () => {
    startPreviewSession();
    // Hard navigation so AuthGate reliably reads the preview session.
    window.location.assign(redirect.startsWith("/") ? redirect : "/");
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Supabase is not configured yet. Use UI preview for now.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(redirect)}`,
        queryParams: {
          prompt: "select_account",
          hd: "gmail.com",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  const signInWithPasskey = async () => {
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Passkeys need Supabase Auth enabled. Use UI preview for now.");
      setLoading(false);
      return;
    }

    try {
      // WebAuthn via Conditional UI / browser passkeys — enroll on Security page after Google login.
      // Here we attempt credential get if the browser supports it.
      if (!window.PublicKeyCredential) {
        setError("This browser does not support passkeys.");
        setLoading(false);
        return;
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const webauthn = factors?.all?.find(
        (f) => f.status === "verified" && (f.factor_type === "webauthn" || f.friendly_name?.toLowerCase().includes("passkey"))
      );

      if (!webauthn) {
        setError(
          "No passkey on file yet. Sign in with Google first, then enroll a passkey under Security."
        );
        setLoading(false);
        return;
      }

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: webauthn.id });
      if (challengeError) throw challengeError;

      setFactorId(webauthn.id);
      setChallengeId(challenge.id);
      setStep("passkey-enroll");
      setError(
        "Complete the passkey prompt from your device, then finish on Security if needed."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Passkey sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const startTotpChallenge = async () => {
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setError("2FA needs Supabase Auth. Use UI preview for now.");
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Sign in with Google first, then enter your authenticator code.");
      setLoading(false);
      setStep("totp");
      return;
    }

    const { data: factors, error: listError } =
      await supabase.auth.mfa.listFactors();
    if (listError) {
      setError(listError.message);
      setLoading(false);
      return;
    }

    const totp = factors.totp.find((f) => f.status === "verified");
    if (!totp) {
      setError("No authenticator enrolled yet. Add one under Security.");
      setStep("totp");
      setLoading(false);
      return;
    }

    const { data, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totp.id,
    });
    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    setFactorId(totp.id);
    setChallengeId(data.id);
    setStep("totp");
    setLoading(false);
  };

  const verifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId) {
      setError("Start a 2FA challenge first (after Google sign-in).");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: totpCode.trim(),
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="steward-atmosphere steward-grain relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-md animate-steward-rise">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl tracking-tight text-[var(--ink)]">
            Steward
          </p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]/75">
            Private life dashboard — locked to {ALLOWED_EMAIL}
          </p>
        </div>

        <div className="widget-panel p-7">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-soft)]/50 p-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-deep)]" />
            <div className="text-sm text-[var(--ink-soft)]">
              <p className="font-semibold text-[var(--ink)]">
                Hardened by design
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                Google sign-in recommended, plus passkeys and authenticator
                2FA. Only your allowlisted email can enter.
              </p>
            </div>
          </div>

          {step === "choose" ? (
            <div className="space-y-3">
              <Button
                type="button"
                className="h-11 w-full bg-[var(--accent)] hover:bg-[var(--accent-deep)]"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-[var(--line)] bg-white/70"
                onClick={signInWithPasskey}
                disabled={loading}
              >
                <Fingerprint className="h-4 w-4" />
                Sign in with passkey
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-[var(--line)] bg-white/70"
                onClick={startTotpChallenge}
                disabled={loading}
              >
                <Smartphone className="h-4 w-4" />
                Use authenticator 2FA
              </Button>

              {!configured ? (
                <div className="pt-2">
                  <p className="mb-2 text-center text-xs text-[var(--ink-soft)]/65">
                    Auth backend not connected yet — UI preview unlocks the
                    dashboard so we can polish first.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={enterPreview}
                  >
                    <KeyRound className="h-4 w-4" />
                    Enter UI preview
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === "totp" ? (
            <form onSubmit={verifyTotp} className="space-y-4">
              <div>
                <Label htmlFor="totp">Authenticator code</Label>
                <Input
                  id="totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="mt-1.5 tracking-[0.3em]"
                  maxLength={8}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-deep)]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & enter"
                )}
              </Button>
              <button
                type="button"
                className="w-full text-center text-xs text-[var(--ink-soft)]/70 hover:text-[var(--ink)]"
                onClick={() => setStep("choose")}
              >
                Back to sign-in options
              </button>
            </form>
          ) : null}

          {step === "passkey-enroll" ? (
            <div className="space-y-3 text-sm text-[var(--ink-soft)]">
              <p>
                Follow your device’s passkey prompt. Manage enrolled keys anytime
                under Security.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("choose")}
              >
                Back
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
          ) : null}
        </div>

        <ol className="mt-6 space-y-2 px-1 text-xs text-[var(--ink-soft)]/70">
          <li>1. Sign in with Google using {ALLOWED_EMAIL}</li>
          <li>2. Enroll a passkey (Touch ID / Face ID / security key)</li>
          <li>3. Add authenticator 2FA as backup</li>
        </ol>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center steward-atmosphere">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
