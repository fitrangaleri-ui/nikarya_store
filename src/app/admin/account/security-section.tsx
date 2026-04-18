"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import {
  LockClosedIcon,
  ArrowRightStartOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
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
    <div className="space-y-5 md:space-y-6">
      {/* Change Password */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <LockClosedIcon className="h-4 w-4 text-white" />
          </div>
          <Typography variant="h6" as="h2" className="text-white font-bold">
            Ubah Kata Sandi
          </Typography>
        </div>
        <div className="p-5 md:p-7">
          <form action={handlePasswordChange} className="space-y-5">
            {/* Pesan Error */}
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-3 animate-in fade-in zoom-in-95">
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Pesan Sukses */}
            {success && (
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary flex items-center gap-3 animate-in fade-in zoom-in-95">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                Sandi berhasil diperbarui!
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="new_password"
                className="text-xs font-bold text-muted-foreground uppercase  ml-1"
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
                className="h-11 rounded-sm border-border/70 bg-background/50 text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm_password"
                className="text-xs font-bold text-muted-foreground uppercase  ml-1"
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
                className="h-11 rounded-sm border-border/70 bg-background/50 text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="pt-4 border-t border-border/40">
              <Button
                type="submit"
                variant="brand"
                className="w-full h-12 rounded-full transition-all active:scale-[0.98] disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Ubah Kata Sandi"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Logout */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 md:p-7">
          <form action={logout}>
            <Button
              variant="outline"
              className="w-full h-12 justify-center gap-3 rounded-full border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold transition-all active:scale-95 shadow-none"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              Keluar dari Akun
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
