"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Fingerprint,
  Loader2,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";
import { tryCreateClient } from "@/lib/supabase/client";
import { ALLOWED_EMAIL } from "@/lib/auth-allowlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FactorRow = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
};

export default function SecurityPage() {
  const configured = isSupabaseConfigured();
  const [factors, setFactors] = useState<FactorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qr?: string;
    secret?: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [passkeyName, setPasskeyName] = useState("Mac / iPhone");

  const refreshFactors = useCallback(async () => {
    const supabase = tryCreateClient();
    if (!supabase) return;
    const { data } = await supabase.auth.mfa.listFactors();
    const all = (data?.all ?? []) as FactorRow[];
    setFactors(all);
  }, []);

  useEffect(() => {
    refreshFactors();
  }, [refreshFactors]);

  const enrollTotp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Connect Supabase Auth to enroll authenticator 2FA.");
      setLoading(false);
      return;
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Steward Authenticator",
    });

    if (enrollError) {
      setError(enrollError.message);
      setLoading(false);
      return;
    }

    setEnrolling({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setLoading(false);
  };

  const verifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolling) return;
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({
      factorId: enrolling.factorId,
    });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verified = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });

    if (verified.error) {
      setError(verified.error.message);
      setLoading(false);
      return;
    }

    setMessage("Authenticator 2FA is active.");
    setEnrolling(null);
    setCode("");
    await refreshFactors();
    setLoading(false);
  };

  const enrollPasskey = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!window.PublicKeyCredential) {
      setError("This browser does not support passkeys.");
      setLoading(false);
      return;
    }

    const supabase = tryCreateClient();
    if (!supabase) {
      setError(
        "Passkey enrollment needs Supabase Auth. UI is ready — connect the backend next."
      );
      setLoading(false);
      return;
    }

    try {
      // Supabase WebAuthn MFA: enable under Auth → MFA, then this enroll call works.
      // Typed loosely until the published client exposes webauthn in MFAEnrollParams.
      const mfa = supabase.auth.mfa as unknown as {
        enroll: (params: {
          factorType: string;
          friendlyName?: string;
        }) => Promise<{ data: { id: string } | null; error: Error | null }>;
      };

      const { data, error: enrollError } = await mfa.enroll({
        factorType: "webauthn",
        friendlyName: passkeyName || "Steward Passkey",
      });

      if (enrollError) {
        setError(
          enrollError.message +
            " — If WebAuthn MFA isn’t enabled on your Supabase project yet, enable it in Auth → MFA, then retry."
        );
        setLoading(false);
        return;
      }

      setMessage(
        `Passkey factor created (${data?.id ?? "ok"}). Complete the browser prompt, then verify on next sign-in.`
      );
      await refreshFactors();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Passkey enrollment failed.");
    } finally {
      setLoading(false);
    }
  };

  const unenroll = async (factorId: string) => {
    setLoading(true);
    setError("");
    const supabase = tryCreateClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    if (unenrollError) setError(unenrollError.message);
    else setMessage("Factor removed.");
    await refreshFactors();
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <header className="animate-steward-rise mb-8">
        <p className="text-sm font-medium text-[var(--accent)]">Protection</p>
        <h1 className="font-display mt-2 text-4xl text-[var(--ink)]">
          Security
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]/75">
          Steward only admits {ALLOWED_EMAIL}. Layer Google with passkeys and
          authenticator 2FA before connecting banks or vehicles.
        </p>
      </header>

      <div className="grid gap-4">
        <section className="widget-panel animate-steward-rise delay-1 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold">Account lock</h2>
          </div>
          <ul className="space-y-2 text-sm text-[var(--ink-soft)]/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              Email allowlist enforced in middleware
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              Google OAuth as primary identity
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              Passkey + TOTP enrollment surfaces ready
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              Search engines blocked via robots metadata
            </li>
          </ul>
          {!configured ? (
            <p className="mt-4 rounded-xl border border-[var(--line)] bg-white/50 p-3 text-xs text-[var(--ink-soft)]/70">
              Supabase isn’t connected in this environment yet. The UI and
              flows are in place — add project keys and enable Google + MFA to
              go live.
            </p>
          ) : null}
        </section>

        <section className="widget-panel animate-steward-rise delay-2 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold">Passkeys</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--ink-soft)]/75">
            Use Touch ID, Face ID, or a hardware key. Strongest everyday unlock
            for a personal vault like this.
          </p>
          <div className="mb-3">
            <Label htmlFor="passkey-name">Device name</Label>
            <Input
              id="passkey-name"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button
            type="button"
            onClick={enrollPasskey}
            disabled={loading}
            className="bg-[var(--accent)] hover:bg-[var(--accent-deep)]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4" />
            )}
            Enroll passkey
          </Button>
        </section>

        <section className="widget-panel animate-steward-rise delay-3 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold">Authenticator 2FA</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--ink-soft)]/75">
            Backup codes from Google Authenticator, 1Password, or Authy.
          </p>

          {!enrolling ? (
            <Button
              type="button"
              variant="outline"
              className="border-[var(--line)] bg-white/70"
              onClick={enrollTotp}
              disabled={loading}
            >
              Add authenticator
            </Button>
          ) : (
            <form onSubmit={verifyEnrollment} className="space-y-4">
              {enrolling.qr ? (
                <div
                  className="overflow-hidden rounded-xl border border-[var(--line)] bg-white p-3"
                  // QR from Supabase is an svg data URL / markup-safe image source
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={enrolling.qr}
                    alt="Scan with authenticator app"
                    className="mx-auto h-44 w-44"
                  />
                </div>
              ) : null}
              {enrolling.secret ? (
                <p className="text-xs text-[var(--ink-soft)]/65">
                  Secret:{" "}
                  <code className="rounded bg-white/80 px-1.5 py-0.5">
                    {enrolling.secret}
                  </code>
                </p>
              ) : null}
              <div>
                <Label htmlFor="enroll-code">Confirm code</Label>
                <Input
                  id="enroll-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1.5 tracking-[0.3em]"
                  inputMode="numeric"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[var(--accent)] hover:bg-[var(--accent-deep)]"
              >
                Verify & activate
              </Button>
            </form>
          )}
        </section>

        <section className="widget-panel animate-steward-rise delay-4 p-5">
          <h2 className="mb-3 text-sm font-semibold">Enrolled factors</h2>
          {factors.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]/60">
              None yet — enroll a passkey and authenticator above.
            </p>
          ) : (
            <ul className="space-y-2">
              {factors.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">
                      {f.friendly_name || f.factor_type}
                    </p>
                    <p className="text-xs text-[var(--ink-soft)]/60">
                      {f.factor_type} · {f.status}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => unenroll(f.id)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {message ? (
          <p className="text-sm text-[var(--ok)]">{message}</p>
        ) : null}
        {error ? (
          <p className="text-sm text-[var(--danger)]">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
