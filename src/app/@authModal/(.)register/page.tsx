"use client";

import { useActionState, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "../../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MailCheck,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertOctagon,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

type RegisterState = {
  error?: string;
  success?: boolean;
} | null;

function RegisterModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  // ── State toggle password ──
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(async (prevState: RegisterState, formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { error: "Kata sandi dan konfirmasi tidak cocok." };
    }
    if (password.length < 6) {
      return { error: "Kata sandi minimal 6 karakter." };
    }

    const result = await register(formData);
    return result || null;
  }, null);

  const navigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.replace(`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`);
  };

  // ── State sukses ──
  if (state?.success) {
    return (
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          showCloseButton={false}
          className="sm:max-w-[420px] bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl shadow-black/20 rounded-3xl border border-border/50
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            duration-300 ease-out"
        >
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
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                  <MailCheck className="w-3 h-3" />
                  Registrasi Berhasil
                </span>
                <DialogTitle className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                  Cek Email Anda
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-primary-foreground/70">
                  Link verifikasi telah dikirim ke email Anda.
                </DialogDescription>
              </div>
              <button
                onClick={() => handleOpenChange(false)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground/80 hover:text-primary-foreground transition-all active:scale-95 border border-white/20"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body sukses */}
          <div className="px-6 py-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kami telah mengirimkan link verifikasi. Silakan cek email Anda
                untuk mengaktifkan akun dan mulai berbelanja.
              </p>
            </div>

            <Button
              size="lg"
              variant="brand"
              onClick={() => handleOpenChange(false)}
              className="w-full"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Form register normal ──
  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
        className="sm:max-w-[420px] bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl shadow-black/20 rounded-3xl border border-border/50
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          duration-300 ease-out"
      >
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

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                <UserPlus className="w-3 h-3" />
                Buat Akun
              </span>
              <DialogTitle className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                Buat Akun Baru
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-primary-foreground/70">
                Daftar untuk menyimpan koleksi favorit.
              </DialogDescription>
            </div>

            <button
              onClick={() => handleOpenChange(false)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground/80 hover:text-primary-foreground transition-all active:scale-95 border border-white/20"
              aria-label="Tutup"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <form action={formAction} className="px-6 py-5 space-y-3">
          {/* Error */}
          {state?.error && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-2 animate-in fade-in zoom-in-95">
              <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {/* Nama Lengkap */}
          <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="fullName"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="h-7 p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                  Alamat Email <span className="text-destructive">*</span>
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

          {/* Kata Sandi */}
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
                  Kata Sandi <span className="text-destructive">*</span>
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
                  Konfirmasi Sandi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
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
          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            <UserPlus className="h-4 w-4" />
            {isPending ? "Memproses..." : "Daftar Sekarang"}
          </Button>

          {/* Login Link */}
          <p className="text-xs text-muted-foreground text-center pt-1 pb-1">
            Sudah memiliki akun?{" "}
            <Link
              href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              onClick={navigateToLogin}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RegisterModal() {
  return (
    <Suspense fallback={null}>
      <RegisterModalInner />
    </Suspense>
  );
}
