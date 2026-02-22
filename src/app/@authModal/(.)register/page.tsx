"use client";

import { useActionState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "../../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MailCheck } from "lucide-react";

type RegisterState = {
  error?: string;
  success?: boolean;
} | null;

function RegisterModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(async (prevState: RegisterState, formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { error: "Kata sandi dan konfirmasi tidak cocok." };
    }
    if (password.length < 6) {
      return { error: "Kata sandi minimal 6 karakter." };
    }

    const result = await register(formData);
    return result || null;
  }, null);

  const navigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.replace(`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`);
  };

  // State sukses setelah daftar
  if (state?.success) {
    return (
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md bg-background/95 backdrop-blur-xl p-8 text-center border border-border/40 shadow-2xl rounded-3xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          duration-300 ease-out"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

          <DialogTitle className="sr-only">Registrasi Berhasil</DialogTitle>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Cek Email Anda
          </h2>
          <DialogDescription className="text-sm text-muted-foreground mb-8">
            Kami telah mengirimkan link verifikasi. Silakan cek email Anda untuk
            mengaktifkan akun dan mulai berbelanja.
          </DialogDescription>
          <Button
            size="lg"
            variant="brand"
            onClick={() => handleOpenChange(false)}
            className="w-full rounded-full h-12"
          >
            Tutup
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Form register normal
  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl rounded-3xl border border-border/40
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        duration-300 ease-out"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        {/* Header Modal - Minimalist */}
        <div className="px-6 pt-7 pb-2 text-center">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            Buat Akun Baru
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            Daftar untuk menyimpan koleksi favorit.
          </DialogDescription>
        </div>

        <form action={formAction} className="px-6 pb-7 pt-4 space-y-5">
          {state?.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
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
          </div>

          <Button
            type="submit"
            variant="brand"
            className="w-full rounded-full h-11 mt-2"
            disabled={isPending}
          >
            {isPending ? "Memproses..." : "Daftar Sekarang"}
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-3">
            Sudah memiliki akun?{" "}
            <Link
              href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              onClick={navigateToLogin}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RegisterModal() {
  return (
    <Suspense fallback={null}>
      <RegisterModalInner />
    </Suspense>
  );
}
