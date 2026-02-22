"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, loginWithGoogle } from "../../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function GoogleIcon() {
  return (
    <svg
      className="mr-2.5 h-4 w-4"
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  );
}

function LoginModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local state untuk mengontrol visibilitas dialog
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => router.back(), 200);
    }
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        handleOpenChange(false);
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

  const navigateToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    router.replace(`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`);
  };

  const navigateToForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setTimeout(() => {
      router.push("/forgot-password");
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl rounded-3xl border border-border/40
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        duration-300 ease-out"
      >
        {/* Header Modal - Dibuat lebih ringkas */}
        <div className="px-6 pt-7 pb-2 text-center">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            Selamat Datang Kembali
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            Masuk untuk mengakses koleksi Anda.
          </DialogDescription>
        </div>

        <div className="px-6 pb-7 space-y-5">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Kata Sandi
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center gap-2 ml-1">
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
                onClick={navigateToForgotPassword}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Lupa Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full rounded-full h-11"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Minimalist Divider */}
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

          <Button
            variant="outline"
            type="button"
            className="w-full h-11 rounded-full border-border/50 bg-transparent text-foreground hover:bg-muted/50 font-medium text-sm transition-all"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Belum punya akun?{" "}
            <Link
              href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              onClick={navigateToRegister}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Daftar
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LoginModal() {
  return (
    <Suspense fallback={null}>
      <LoginModalInner />
    </Suspense>
  );
}
