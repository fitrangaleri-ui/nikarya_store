"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "../(auth)/actions";
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
import { LockKeyhole, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        // updatePassword redirects on success, but if it returns without error
        // show success state briefly
        setSuccess(true);
      }
    });
  }

  // ── STATE SUKSES ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md border-border bg-background shadow-lg text-center p-6 rounded-none">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight mb-3">
            Password Berhasil Diubah
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-8">
            Password Anda telah berhasil diperbarui. Silakan login dengan
            password baru Anda.
          </CardDescription>
          <Button
            asChild
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
          >
            <Link href="/login">Masuk ke Akun</Link>
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
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
              Buat Password Baru
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan password baru yang aman untuk akun Anda.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-none bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2 text-left">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-muted-foreground"
              >
                Password Baru <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <p className="text-xs font-medium text-muted-foreground pt-1">
                Minimal 6 karakter
              </p>
            </div>

            <div className="space-y-2 text-left">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-muted-foreground"
              >
                Konfirmasi Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
