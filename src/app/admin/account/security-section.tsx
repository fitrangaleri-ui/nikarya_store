"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { changePassword } from "./actions";
import { logout } from "@/app/(auth)/actions";

export function SecuritySection() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handlePasswordChange(formData: FormData) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Change Password */}
      <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-border/40">
          <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            Ubah Kata Sandi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <form action={handlePasswordChange} className="space-y-6">
            {/* Pesan Error */}
            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-3 animate-in fade-in zoom-in-95">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Pesan Sukses */}
            {success && (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary flex items-center gap-3 animate-in fade-in zoom-in-95">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                Sandi berhasil diperbarui!
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="new_password"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1"
              >
                Sandi Baru <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="h-12 rounded-xl border-border/50 bg-background/50 text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm_password"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1"
              >
                Konfirmasi Sandi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={6}
                placeholder="Ulangi sandi baru"
                className="h-12 rounded-xl border-border/50 bg-background/50 text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="pt-4 border-t border-border/40">
              <Button
                type="submit"
                variant="brand"
                className="w-full h-12 rounded-full shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Ubah Kata Sandi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <form action={logout}>
            <Button
              variant="outline"
              className="w-full h-12 justify-center gap-3 rounded-full shadow-sm border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold transition-all active:scale-95"
            >
              <LogOut className="h-5 w-5" />
              Keluar dari Akun
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
