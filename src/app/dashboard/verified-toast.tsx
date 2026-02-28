"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export function VerifiedToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (searchParams.get("verified") === "1") {
            setShow(true);
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete("verified");
            router.replace(url.pathname + url.search, { scroll: false });

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    if (!show) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3.5 rounded-2xl shadow-xl shadow-primary/25 border border-white/15">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">Email berhasil diverifikasi! 🎉</p>
                <button
                    onClick={() => setShow(false)}
                    className="shrink-0 w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
