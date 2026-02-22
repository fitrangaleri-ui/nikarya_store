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
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="border-border shadow-none bg-background rounded-none">
        <CardHeader className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border">
          <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form action={handlePasswordChange} className="space-y-6">
            {/* Pesan Error */}
            {error && (
              <div className="rounded-none border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-semibold text-destructive flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Pesan Sukses */}
            {success && (
              <div className="rounded-none border border-primary/20 bg-primary/10 p-3.5 text-sm font-semibold text-primary flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Password berhasil diubah!
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="new_password"
                className="text-sm font-semibold text-muted-foreground"
              >
                Password Baru <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm_password"
                className="text-sm font-semibold text-muted-foreground"
              >
                Konfirmasi Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={6}
                placeholder="Ulangi password baru"
                className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98] disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-border shadow-none bg-background rounded-none">
        <CardContent className="p-4 sm:p-6">
          <form action={logout}>
            <Button
              variant="outline"
              className="w-full justify-center gap-3 h-11 rounded-none shadow-none border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold transition-all active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Keluar dari Akun
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
