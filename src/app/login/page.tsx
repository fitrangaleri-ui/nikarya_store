"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, loginWithGoogle } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";

// Komponen Icon Google (SVG)
function GoogleIcon() {
  return (
    <svg
      className="mr-2 h-4 w-4"
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
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

function LoginFormInner() {
  const searchParams = useSearchParams();
  // Mengambil parameter 'redirectTo' dari URL browser (contoh: /login?redirectTo=/checkout)
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle Login Email/Password
  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  // Handle Login Google
  const handleGoogleLogin = () => {
    setError(null);
    startTransition(async () => {
      // Mengirim nilai 'redirectTo' ke server action agar Google tahu tujuan pulang
      const result = await loginWithGoogle(redirectTo || "/dashboard");
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Masuk ke Akun
          </CardTitle>
          <CardDescription className="text-slate-500">
            Pilih metode login untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Tombol Google Login */}
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            {isPending ? (
              "Memproses..."
            ) : (
              <>
                <GoogleIcon />
                Lanjutkan dengan Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Atau login dengan email
              </span>
            </div>
          </div>

          {/* Form Login Biasa */}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 animate-pulse">Memuat...</p>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
