"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login, loginWithGoogle } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, AlertOctagon, Eye, EyeOff } from "lucide-react";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const handleGoogleLogin = () => {
    setError(null);
    startTransition(async () => {
      const result = await loginWithGoogle(redirectTo || "/dashboard");
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[420px] bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* ── Header Banner ── */}
        <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
              <LogIn className="w-3 h-3" />
              Masuk Akun
            </span>
            <h1 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="mt-0.5 text-xs text-primary-foreground/70">
              Masuk untuk mengakses koleksi Anda.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-2 animate-in fade-in zoom-in-95">
              <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-3">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* Email Field */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    className="h-7 p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Password Field + Toggle Eye */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Kata Sandi
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-7 p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 mt-0.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-border/50 h-3.5 w-3.5 focus:ring-primary text-primary bg-background cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-[11px] font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  Ingat Saya
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Lupa Sandi?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              <LogIn className="h-4 w-4" />
              {isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background/95 px-3 text-muted-foreground text-[10px]">
                atau
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            type="button"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            <Image
              src="/google.png"
              alt="Google"
              width={18}
              height={18}
              className="mr-2 shrink-0"
            />
            {isPending ? "Memproses..." : "Lanjutkan dengan Google"}
          </Button>

          {/* Register Link */}
          <p className="text-xs text-muted-foreground text-center pt-1 pb-1">
            Belum punya akun?{" "}
            <Link
              href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
