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
          className="sm:max-w-md bg-background p-6 text-center border border-border shadow-xl rounded-none
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          duration-500 ease-out"
        >
          <DialogTitle className="sr-only">Registrasi Berhasil</DialogTitle>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
            Cek Email Anda
          </h2>
          <DialogDescription className="text-sm text-muted-foreground mb-6">
            Kami telah mengirimkan link verifikasi. Silakan cek email Anda untuk
            mengaktifkan akun.
          </DialogDescription>
          <Button
            size="lg"
            onClick={() => handleOpenChange(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-sm font-bold transition-all active:scale-[0.98]"
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
        className="sm:max-w-md bg-background p-0 overflow-hidden shadow-xl rounded-none border border-border
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        duration-500 ease-out"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
            Daftar Akun
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form registrasi akun baru.
          </DialogDescription>
        </div>

        <form action={formAction} className="p-6 space-y-6">
          {state?.error && (
            <div className="rounded-none bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-semibold text-muted-foreground"
              >
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                className="h-11 rounded-none border-border focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background text-sm font-medium"
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Konfirmasi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-none border-border focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-none font-bold text-sm h-11 transition-all active:scale-[0.98] mt-2"
            disabled={isPending}
          >
            {isPending ? "Memproses..." : "Daftar Sekarang"}
          </Button>

          <div className="text-sm text-muted-foreground text-center pt-2">
            Sudah memiliki akun?{" "}
            <Link
              href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              onClick={navigateToLogin}
              className="text-primary hover:underline hover:text-primary/80 font-semibold transition-colors"
            >
              Masuk di sini
            </Link>
          </div>
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
