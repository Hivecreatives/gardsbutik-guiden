"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/clients";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Leaf, UserPlus, ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "signup" | "verify";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);

  // ── Step 1: Sign up ──────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep("verify");
    setLoading(false);
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 8) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown) return;
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResendCooldown(true);
    setTimeout(() => setResendCooldown(false), 30000);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 font-body">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzJDMUEwRSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-moss shadow-lg shadow-moss/30 mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-soil font-display">
            Gårdsbutik Guiden
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Skapa ditt konto</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-soil/10 border border-soil/5 p-8">
          {/* ── Signup Form ── */}
          {step === "signup" && (
            <>
              <h2 className="text-xl font-bold text-soil font-display mb-6">
                Registrera dig
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Fullständigt namn
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Anna Larsson"
                    className="w-full h-10 px-3 rounded-lg border border-soil/20 bg-cream/50 text-soil placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    E-postadress
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.se"
                    className="w-full h-10 px-3 rounded-lg border border-soil/20 bg-cream/50 text-soil placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Lösenord
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minst 6 tecken"
                      className="w-full h-10 px-3 pr-10 rounded-lg border border-soil/20 bg-cream/50 text-soil placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-soil transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-moss text-white rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-moss/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Skapa konto
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── OTP Verify ── */}
          {step === "verify" && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-moss" />
                </div>
                <h2 className="text-xl font-bold text-soil font-display">
                  Verifiera din e-post
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Vi skickade en 6-siffrig kod till{" "}
                  <span className="font-semibold text-soil">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="flex justify-center">
                  <InputOTP maxLength={8} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-moss text-white rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-moss/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verifiera
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signup");
                      setError(null);
                      setOtp("");
                    }}
                    className="text-slate-400 hover:text-soil transition-colors"
                  >
                    ← Tillbaka
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown}
                    className="text-moss font-semibold hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                  >
                    {resendCooldown ? "Kod skickad — vänta 30s" : "Skicka igen"}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-soil/5 text-center">
            <p className="text-sm text-slate-500">
              Har du redan ett konto?{" "}
              <Link
                href="/login"
                className="text-moss font-semibold hover:underline"
              >
                Logga in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Gårdsbutik Guiden. Alla rättigheter
          förbehållna.
        </p>
      </div>
    </div>
  );
}
