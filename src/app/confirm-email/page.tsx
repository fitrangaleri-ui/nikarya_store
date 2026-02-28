"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, Mail, AlertOctagon, Loader2 } from "lucide-react";

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
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

                <div className="w-full max-w-[420px] bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
                        <div
                            aria-hidden
                            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                        />
                        <div
                            aria-hidden
                            className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                            }}
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                boxShadow:
                                    "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                            }}
                        />
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                                <MailCheck className="w-3 h-3" />
                                Sudah Terverifikasi
                            </span>
                            <h2 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                                Email Sudah Aktif
                            </h2>
                            <p className="mt-0.5 text-xs text-primary-foreground/70">
                                Anda bisa langsung login ke akun Anda.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-5">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <MailCheck className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Email Anda sudah terverifikasi sebelumnya. Silakan login untuk
                                mengakses dashboard dan produk Anda.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            variant="brand"
                            className="w-full"
                            onClick={() => router.push("/login")}
                        >
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
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

                <div className="w-full max-w-[420px] bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
                        <div
                            aria-hidden
                            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                        />
                        <div
                            aria-hidden
                            className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                            }}
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                boxShadow:
                                    "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                            }}
                        />
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                                <MailCheck className="w-3 h-3" />
                                Email Terkirim
                            </span>
                            <h2 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                                Cek Email Anda
                            </h2>
                            <p className="mt-0.5 text-xs text-primary-foreground/70">
                                Link verifikasi telah dikirim ke email Anda.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-5">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <MailCheck className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Kami telah mengirimkan link verifikasi ke{" "}
                                <strong className="text-foreground">{email}</strong>. Klik link
                                di email untuk mengaktifkan akun dan mengakses dashboard Anda.
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                Tidak menemukan email? Cek folder spam atau promosi Anda.
                            </p>
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
                            Kirim Ulang
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── FORM STATE ──
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-[420px] bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                {/* ── Header Banner ── */}
                <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
                    <div
                        aria-hidden
                        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                    <div
                        aria-hidden
                        className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                        }}
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                        }}
                    />

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                            <MailCheck className="w-3 h-3" />
                            Konfirmasi Email
                        </span>
                        <h1 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                            Konfirmasi Email Anda
                        </h1>
                        <p className="mt-0.5 text-xs text-primary-foreground/70">
                            Verifikasi email untuk mengakses dashboard.
                        </p>
                    </div>
                </div>

                {/* ── Body ── */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Info text */}
                    <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Pembayaran Anda telah dikonfirmasi! Langkah terakhir: verifikasi
                            email untuk mengaktifkan akun dan mengakses produk Anda.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-2 animate-in fade-in zoom-in-95">
                            <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Label
                                    htmlFor="email"
                                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    Alamat Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="nama@email.com"
                                    required
                                    className="h-7 p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 mt-0.5"
                                />
                            </div>
                        </div>
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
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <MailCheck className="h-4 w-4" />
                                Kirim Link Verifikasi
                            </>
                        )}
                    </Button>

                    {/* Login link */}
                    <p className="text-xs text-muted-foreground text-center pt-1 pb-1">
                        Sudah verifikasi?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:text-primary/80 font-semibold transition-colors"
                        >
                            Masuk ke akun
                        </Link>
                    </p>
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
