"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MailCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkVerification = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            if (user.email_confirmed_at) {
                // Already verified — go to login page
                router.push("/login");
                return;
            }

            setEmail(user.email || null);
            setChecking(false);
        };

        checkVerification();

        // Poll every 5 seconds to check if email has been verified
        const interval = setInterval(async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user?.email_confirmed_at) {
                router.push("/login");
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        try {
            const supabase = createClient();
            await supabase.auth.resend({
                type: "signup",
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm?next=/login`,
                },
            });
            setResent(true);
            setTimeout(() => setResent(false), 10000);
        } catch {
            // silent
        } finally {
            setResending(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[70vh] px-4">
                <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-8 text-center relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />

                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                        <MailCheck className="h-10 w-10 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                        Verifikasi Email Anda
                    </h1>
                    <p className="text-sm text-slate-500 leading-relaxed mb-2">
                        Kami telah mengirim link verifikasi ke:
                    </p>
                    {email && (
                        <p className="text-sm font-semibold text-slate-800 bg-slate-50 rounded-xl px-4 py-2 mb-6 border border-slate-100">
                            {email}
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mb-6">
                        Klik link di email untuk mengaktifkan akun dan mengakses dashboard
                        Anda. Halaman ini akan otomatis berpindah setelah verifikasi
                        berhasil.
                    </p>

                    {resent ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Email verifikasi terkirim ulang!
                            </span>
                        </div>
                    ) : (
                        <Button
                            onClick={handleResend}
                            disabled={resending}
                            variant="outline"
                            className="w-full rounded-full h-11 border-slate-200 hover:bg-slate-50 mb-4"
                        >
                            {resending ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim ulang...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Kirim Ulang Email Verifikasi
                                </>
                            )}
                        </Button>
                    )}

                    <p className="text-xs text-slate-400">
                        Tidak menemukan email? Cek folder spam atau promosi Anda.
                    </p>
                </div>
            </div>
        </div>
    );
}
