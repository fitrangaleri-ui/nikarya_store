"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/solid";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim email verifikasi");
        return;
      }

      if (data.alreadyVerified) {
        setAlreadyVerified(true);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // ── ALREADY VERIFIED STATE ──
  if (alreadyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10">
              <Typography variant="h3" className="text-white leading-tight">
                Sudah Aktif
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Email Anda telah terverifikasi sebelumnya.
              </Typography>
            </div>
          </div>

          <div className="px-8 py-10 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center animate-in zoom-in duration-700">
                <CheckCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <Typography variant="h4" className="font-bold">
                  Email Terverifikasi
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground leading-relaxed">
                  Anda bisa langsung login untuk mengakses dashboard dan produk Anda.
                </Typography>
              </div>
            </div>

            <Button
              size="lg"
              variant="brand"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
              Masuk ke Akun
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10">
              <Typography variant="h3" className="text-white leading-tight">
                Cek Email Anda
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Link verifikasi baru telah dikirimkan.
              </Typography>
            </div>
          </div>

          <div className="px-8 py-10 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center animate-in zoom-in duration-700">
                <EnvelopeIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <Typography variant="h4" className="font-bold">
                  Email Terkirim
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground leading-relaxed">
                  Kami telah mengirimkan link verifikasi ke <strong className="text-foreground">{email}</strong>. 
                  Silakan periksa kotak masuk atau folder spam Anda.
                </Typography>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
            >
              Kirim Ulang Jika Belum Menerima
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ──
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[420px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* ── Header Banner ── */}
        <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start">
            <div>
              <Typography variant="h3" className="text-white leading-tight">
                Verifikasi Email
              </Typography>
              <Typography variant="body-sm" className="text-white/70 mt-1 font-medium">
                Aktifkan akun Anda untuk mulai berbelanja.
              </Typography>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {/* Info text */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
            <Typography variant="caption" className="text-muted-foreground leading-relaxed block">
              Konfirmasi pembayaran berhasil! Langkah terakhir: verifikasi email untuk 
              mengaktifkan akun dan mengakses produk digital Anda.
            </Typography>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3 animate-in fade-in zoom-in-95">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
              <Typography variant="body-sm" color="destructive">
                {error}
              </Typography>
            </div>
          )}

          {/* Email Field */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
              <EnvelopeIcon className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Masukkan alamat email Anda"
              required
              className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            variant="brand"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" />
                Kirim Link Verifikasi
              </>
            )}
          </Button>

          {/* Login link */}
          <div className="text-center pt-2">
            <Typography variant="body-sm" className="text-muted-foreground text-center">
              Sudah verifikasi?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline underline-offset-8 transition-all"
              >
                Masuk ke akun
              </Link>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
