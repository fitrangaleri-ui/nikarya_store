"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login, loginWithGoogle } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  ArrowRightStartOnRectangleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [isLoginPending, startLoginTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startLoginTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const handleGoogleLogin = () => {
    setError(null);
    startGoogleTransition(async () => {
      const result = await loginWithGoogle(redirectTo || "/dashboard");
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="flex flex-col items-center gap-6 w-full max-w-[420px] relative z-10">
        <Breadcrumb className="self-start ml-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <HomeIcon className="h-4 w-4" />
                  Beranda
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary/80">Login</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="w-full glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* ── Header Banner ── */}
        <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start">
            <div>
              <Typography variant="h3" className="text-white leading-tight">
                Selamat Datang
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Masuk ke akun Anda untuk melanjutkan.
              </Typography>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-7 space-y-6">
          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3 animate-in fade-in zoom-in-95">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
              <Typography variant="body-sm" color="destructive">
                {error}
              </Typography>
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

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
                placeholder="Masukkan kata sandi Anda"
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

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded-lg border-border/50 h-4.5 w-4.5 focus:ring-primary text-primary transition-all cursor-pointer bg-muted/40"
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer select-none"
                >
                  <Typography variant="body-sm" className="font-medium text-muted-foreground hover:text-foreground">
                    Ingat Saya
                  </Typography>
                </label>
              </div>

              <Link
                href="/forgot-password"
                className="transition-colors hover:text-primary"
              >
                <Typography variant="body-sm" className="font-medium text-muted-foreground hover:text-primary">
                  Lupa Sandi?
                </Typography>
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full mt-2"
              disabled={isLoginPending || isGooglePending}
            >
              {isLoginPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                  Masuk Sekarang
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center uppercase">
              <Typography variant="caption" className="bg-background px-4 text-muted-foreground font-medium capitalize text-[12px]">
                Atau Lanjutkan Dengan
              </Typography>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            type="button"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoginPending || isGooglePending}
          >
            {isGooglePending ? (
              <div className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <Typography variant="body-sm" className="font-bold">
                  Memproses...
                </Typography>
              </div>
            ) : (
              <>
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-3 shrink-0"
                />
                <Typography variant="body-sm" className="font-bold">
                  Google Account
                </Typography>
              </>
            )}
          </Button>

          {/* Register Link */}
          <div className="text-center pt-2">
            <Typography variant="body-sm" className="text-muted-foreground text-center">
              Belum memiliki akun?{" "}
              <Link
                href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
                className="text-primary font-semibold hover:underline underline-offset-8 transition-all"
              >
                Buat Akun Baru
              </Link>
            </Typography>
          </div>
        </div>
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
