"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, MailCheck } from "lucide-react";

// 1. Definisikan tipe data state secara eksplisit
type RegisterState = {
  error?: string;
  success?: boolean;
} | null;

export default function RegisterPage() {
  // 2. Gunakan tipe data tersebut pada useActionState
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(async (prevState: RegisterState, formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { error: "Password dan konfirmasi password tidak cocok." };
    }

    if (password.length < 6) {
      return { error: "Password minimal 6 karakter." };
    }

    // Pastikan fungsi register di actions.ts mengembalikan object yang sesuai
    const result = await register(formData);

    // Mengubah kembalian 'undefined' menjadi 'null' agar sesuai tipe data
    return result || null;
  }, null);

  // 3. Sekarang TypeScript tahu bahwa state bisa punya properti success
  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Cek Email Anda
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Kami telah mengirimkan link verifikasi ke alamat email yang Anda
            daftarkan. Silakan klik link tersebut untuk mengaktifkan akun.
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ornamen Halus */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[400px] bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">
        {/* Glow Akses Dalam Box */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="text-center px-6 pt-10 pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-5">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Daftar untuk mulai menyimpan koleksi favorit.
          </p>
        </div>

        <div className="px-6 pb-8 space-y-5">
          {state?.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="fullName"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

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
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            {/* Grid 2 Kolom untuk Password */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-muted-foreground ml-1"
                >
                  Kata Sandi <span className="text-destructive">*</span>
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
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-muted-foreground ml-1"
                >
                  Konfirmasi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="brand"
                className="w-full rounded-full h-11"
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
