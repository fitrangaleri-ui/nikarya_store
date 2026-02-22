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
      className="mr-2 h-4 w-4"
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
      // Tunggu animasi selesai baru router.back()
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
    setIsOpen(false); // Tutup modal secara visual dulu

    // Tunggu animasi penutupan berjalan, lalu arahkan ke forgot password
    setTimeout(() => {
      router.push("/forgot-password");
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-md bg-background p-0 overflow-hidden shadow-xl rounded-none border border-border
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        duration-500 ease-out"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
            Masuk Akun
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form login untuk masuk ke akun Anda.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-none bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-muted-foreground"
              >
                Alamat Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-11 rounded-none border-border focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-muted-foreground"
              >
                Kata Sandi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 rounded-none border-border focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background text-sm font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded-none border-border h-4 w-4 focus:ring-primary text-primary bg-background cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                >
                  Ingat Saya
                </Label>
              </div>

              <Link
                href="/forgot-password"
                onClick={navigateToForgotPassword}
                className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                Lupa Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-none font-bold text-sm h-11 transition-all active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative pt-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground font-medium text-xs">
                atau lanjutkan dengan
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            size="lg"
            className="w-full h-11 border-border text-foreground hover:bg-muted hover:border-primary/50 hover:text-primary rounded-none shadow-none font-bold text-sm transition-all active:scale-[0.98]"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            <GoogleIcon />
            Google
          </Button>

          <div className="text-sm text-muted-foreground text-center pt-2">
            Belum punya akun?{" "}
            <Link
              href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              onClick={navigateToRegister}
              className="text-primary hover:underline hover:text-primary/80 font-semibold transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
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
