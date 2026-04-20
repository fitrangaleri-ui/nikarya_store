"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updatePassword } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import {
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {success ? (
          <>
            {/* ── Success Header ── */}
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 px-8 pt-9 pb-8 overflow-hidden">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-start text-white">

                <Typography variant="h3" className="text-white">
                  Sandi Diperbarui
                </Typography>
                <Typography variant="body-sm" className="text-white/80 mt-1 font-medium">
                  Kata sandi Anda telah berhasil diubah secara aman.
                </Typography>
              </div>
            </div>

            {/* ── Success Body ── */}
            <div className="px-8 py-8 space-y-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
                <Typography variant="body-base" color="muted" className="max-w-[300px]">
                  Silakan masuk menggunakan kata sandi baru Anda untuk kembali mengakses akun.
                </Typography>
              </div>

              <Button asChild size="lg" variant="brand" className="w-full">
                <Link href="/login">Masuk ke Akun Sekarang</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Form Header ── */}
            <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-start text-white">

                <Typography variant="h3" className="text-white leading-tight">
                  Buat Sandi Baru
                </Typography>
                <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                  Masukkan kata sandi baru yang aman untuk akun Anda.
                </Typography>
              </div>
            </div>

            {/* ── Form Body ── */}
            <div className="px-8 py-7 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3 animate-in fade-in zoom-in-95">
                  <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
                  <Typography variant="body-sm" color="destructive">
                    {error}
                  </Typography>
                </div>
              )}

              <form action={handleSubmit} className="space-y-4">
                {/* New Password Field */}
                <div className="space-y-1.5">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                      <LockClosedIcon className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Kata sandi baru"
                      required
                      minLength={6}
                      className="pl-14 pr-12 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Typography variant="caption" color="muted" className="px-1">
                    Minimal 6 karakter kombinasi huruf & angka.
                  </Typography>
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
                    placeholder="Konfirmasi kata sandi"
                    required
                    minLength={6}
                    className="pl-14 pr-12 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    aria-label={showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full mt-2"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <KeyIcon className="h-5 w-5 mr-2" />
                      Simpan Sandi Baru
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-all group"
                >
                  <Typography variant="body-sm" className="font-medium">
                    Batal dan kembali ke Login
                  </Typography>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
