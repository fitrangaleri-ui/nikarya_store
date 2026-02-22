"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Berhasil Diubah
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Kata sandi Anda telah berhasil diperbarui. Silakan masuk menggunakan
            kata sandi baru Anda.
          </p>
          <Button
            asChild
            size="lg"
            variant="brand"
            className="w-full rounded-full h-12 shadow-md shadow-primary/20"
          >
            <Link href="/login">Masuk ke Akun</Link>
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
            <LockKeyhole className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Buat Sandi Baru
          </h1>
          <p className="text-sm text-muted-foreground px-2">
            Masukkan kata sandi baru yang aman untuk akun Anda.
          </p>
        </div>

        <div className="px-6 pb-10">
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Kata Sandi Baru <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
              <p className="text-[10px] font-medium text-muted-foreground pt-0.5 ml-1">
                Minimal 6 karakter
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Konfirmasi Kata Sandi{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                size="lg"
                variant="brand"
                className="w-full rounded-full h-12 shadow-md shadow-primary/20"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan Sandi Baru"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
