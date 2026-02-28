"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LockKeyhole,
  CheckCircle2,
  Lock,
  AlertOctagon,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  // ── STATE SUKSES ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-[420px] bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Header Banner — sukses */}
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
                <CheckCircle2 className="w-3 h-3" />
                Berhasil
              </span>
              <h2 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                Berhasil Diubah
              </h2>
              <p className="mt-0.5 text-xs text-primary-foreground/70">
                Kata sandi Anda telah berhasil diperbarui.
              </p>
            </div>
          </div>

          {/* Body sukses */}
          <div className="px-6 py-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kata sandi Anda telah berhasil diperbarui. Silakan masuk
                menggunakan kata sandi baru Anda.
              </p>
            </div>

            <Button asChild size="lg" variant="brand" className="w-full">
              <Link href="/login">Masuk ke Akun</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM DEFAULT ──
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
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
              <LockKeyhole className="w-3 h-3" />
              Reset Kata Sandi
            </span>
            <h1 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Buat Sandi Baru
            </h1>
            <p className="mt-0.5 text-xs text-primary-foreground/70">
              Masukkan kata sandi baru yang aman untuk akun Anda.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <form action={handleSubmit} className="px-6 py-5 space-y-3">
          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-2 animate-in fade-in zoom-in-95">
              <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Kata Sandi Baru */}
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
                  Kata Sandi Baru <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

          {/* Hint minimal 6 karakter */}
          <p className="text-[10px] font-medium text-muted-foreground px-1">
            Minimal 6 karakter
          </p>

          {/* Konfirmasi Kata Sandi */}
          <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Konfirmasi Kata Sandi{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-7 p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 mt-0.5"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi"
                    : "Tampilkan konfirmasi"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <Button
              type="submit"
              size="lg"
              variant="brand"
              className="w-full"
              disabled={isPending}
            >
              <LockKeyhole className="h-4 w-4" />
              {isPending ? "Menyimpan..." : "Simpan Sandi Baru"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
