"use client";

import { useRouter } from "next/navigation";
import { useActionState, Suspense } from "react";
import Link from "next/link";
import { forgotPassword } from "../(auth)/actions";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLongLeftIcon,
} from "@heroicons/react/24/solid";

type FormState = {
  error?: string;
  success?: boolean;
} | null;

function ForgotPasswordForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prevState, formData) => {
      const result = await forgotPassword(formData);
      return result || null;
    },
    null,
  );

  // ── STATE SUKSES ──
  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Header Banner — sukses */}
          <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-start">
              <Typography variant="h3" className="text-white leading-tight">
                Cek Email Anda
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Instruksi reset kata sandi telah dikirim.
              </Typography>
            </div>
          </div>

          {/* Body sukses */}
          <div className="px-8 py-10 space-y-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center animate-bounce duration-[2000ms]">
              <CheckCircleIcon className="h-10 w-10 text-primary" />
            </div>
            
            <Typography variant="body-sm" className="text-muted-foreground leading-relaxed max-w-[280px]">
              Kami telah mengirimkan instruksi untuk mengatur ulang kata sandi
              ke email Anda. Silakan periksa kotak masuk atau folder spam.
            </Typography>

            <PrimaryButton
              size="lg"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              <ArrowLongLeftIcon className="w-5 h-5 mr-2" />
              Kembali ke Login
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM DEFAULT ──
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* ── Header Banner ── */}
        <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start">
            <Typography variant="h3" className="text-white leading-tight">
              Pulihkan Akun
            </Typography>
            <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
              Masukkan email Anda untuk memulihkan akun.
            </Typography>
          </div>
        </div>

        {/* ── Body ── */}
        <form action={formAction} className="px-8 py-7 space-y-6">
          {/* Error */}
          {state?.error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3 animate-in fade-in zoom-in-95">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
              <Typography variant="body-sm" color="destructive">
                {state.error}
              </Typography>
            </div>
          )}

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

          {/* Submit */}
          <PrimaryButton
            type="submit"
            size="lg"
            className="w-full mt-2"
            loading={isPending}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Kirim Link Reset
          </PrimaryButton>

          {/* Back to Login */}
          <div className="text-center pt-2">
            <Typography variant="body-sm" className="text-muted-foreground">
              Ingat kata sandi Anda?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline underline-offset-8 transition-all"
              >
                Masuk Kembali
              </Link>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
