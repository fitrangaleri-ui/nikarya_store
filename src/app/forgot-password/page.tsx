"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md border-border bg-background shadow-lg text-center p-6 rounded-none">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight mb-3">
            Cek Email Anda
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-8">
            Kami telah mengirimkan link untuk mereset password ke email Anda.
            Silakan cek inbox atau folder spam.
          </CardDescription>
          <Button
            asChild
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
          >
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // ── FORM DEFAULT ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md border-border bg-background shadow-lg rounded-none">
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
              Lupa Kata Sandi?
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan email Anda untuk mendapatkan link reset password.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-none bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                {state.error}
              </div>
            )}

            <div className="space-y-2 text-left">
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
                className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-2 space-y-5">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Kirim Link Reset"}
              </Button>

              <div className="text-center text-sm font-semibold text-muted-foreground">
                Ingat password Anda?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Masuk kembali
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
