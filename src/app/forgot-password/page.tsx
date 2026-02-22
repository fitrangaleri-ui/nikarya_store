"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, MailCheck } from "lucide-react";

type FormState = {
  error?: string;
  success?: boolean;
} | null;

export default function ForgotPasswordPage() {
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Cek Email Anda
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Kami telah mengirimkan instruksi untuk mengatur ulang kata sandi ke
            email Anda. Silakan periksa kotak masuk atau folder spam.
          </p>
          <Button
            asChild
            size="lg"
            variant="brand"
            className="w-full rounded-full h-12 shadow-md shadow-primary/20"
          >
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── FORM DEFAULT ──
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">
        {/* Glow Aksen */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="text-center px-6 pt-10 pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-5">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Lupa Kata Sandi?
          </h1>
          <p className="text-sm text-muted-foreground px-2">
            Masukkan email Anda dan kami akan mengirimkan link untuk memulihkan
            akun.
          </p>
        </div>

        <div className="px-6 pb-10">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Alamat Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="pt-2 space-y-4">
              <Button
                type="submit"
                size="lg"
                variant="brand"
                className="w-full rounded-full h-12 shadow-md shadow-primary/20"
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Kirim Link Reset"}
              </Button>

              <div className="text-center text-xs font-medium text-muted-foreground">
                Ingat kata sandi Anda?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-bold transition-colors"
                >
                  Masuk kembali
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
