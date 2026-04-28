"use client";

import { useActionState, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "../../(auth)/actions";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserPlusIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

type RegisterState = {
  error?: string;
  success?: boolean;
} | null;

function RegisterModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

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
      return { error: "Password dan konfirmasi password tidak cocok." };
    }

    if (password.length < 6) {
      return { error: "Password minimal 6 karakter." };
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
          className="sm:max-w-[420px] p-0 overflow-hidden bg-background rounded-xl border-none shadow-2xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            duration-500"
        >
          <DialogTitle className="sr-only">Registrasi Berhasil</DialogTitle>
          <DialogDescription className="sr-only">
            Satu langkah lagi untuk memulai.
          </DialogDescription>

          {/* Header Banner — sukses */}
          <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <Typography variant="h3" className="text-white leading-tight">
                  Registrasi Berhasil
                </Typography>
                <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                  Satu langkah lagi untuk memulai.
                </Typography>
              </div>

              {/* Close button */}
              <button
                onClick={() => handleOpenChange(false)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 ml-3"
                aria-label="Tutup"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body sukses */}
          <div className="px-8 py-10 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center animate-in zoom-in duration-700">
                <CheckCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <Typography variant="h4" className="font-bold">
                  Cek Email Anda
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground leading-relaxed">
                  Kami telah mengirimkan link verifikasi ke alamat email Anda. 
                  Silakan klik link tersebut untuk mengaktifkan akun Anda.
                </Typography>
              </div>
            </div>

            <PrimaryButton
              size="lg"
              onClick={() => handleOpenChange(false)}
              className="w-full"
            >
              Tutup
            </PrimaryButton>
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
        className="sm:max-w-[420px] p-0 overflow-hidden bg-background rounded-xl border-none shadow-2xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          duration-500"
      >
        <DialogTitle className="sr-only">Buat Akun Baru</DialogTitle>
        <DialogDescription className="sr-only">
          Daftar untuk mulai menyimpan koleksi favorit.
        </DialogDescription>

        {/* ── Header Banner ── */}
        <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <Typography variant="h3" className="text-white leading-tight">
                Buat Akun Baru
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Daftar untuk mulai menyimpan koleksi favorit.
              </Typography>
            </div>

            {/* Close button */}
            <button
              onClick={() => handleOpenChange(false)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 ml-3"
              aria-label="Tutup"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <form action={formAction} className="px-8 py-7 space-y-4">
          {/* Error */}
          {state?.error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3 animate-in fade-in zoom-in-95">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
              <Typography variant="body-sm" color="destructive">
                {state.error}
              </Typography>
            </div>
          )}

          {/* Name Field */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              required
              className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Email Field */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
              <EnvelopeIcon className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Masukkan alamat email Anda"
              required
              className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
              <LockClosedIcon className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi baru"
              required
              className="pl-14 pr-12 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label={
                showPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
              <LockClosedIcon className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi Anda"
              required
              className="pl-14 pr-12 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi sandi"
                  : "Tampilkan konfirmasi sandi"
              }
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Submit */}
          <PrimaryButton
            type="submit"
            size="lg"
            className="w-full mt-4"
            loading={isPending}
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Daftar Sekarang
          </PrimaryButton>

          {/* Login Link */}
          <div className="text-center pt-2">
            <Typography variant="body-sm" className="text-muted-foreground text-center">
              Sudah memiliki akun?{" "}
              <Link
                href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
                onClick={navigateToLogin}
                className="text-primary font-semibold hover:underline underline-offset-8 transition-all"
              >
                Masuk di sini
              </Link>
            </Typography>
          </div>
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
