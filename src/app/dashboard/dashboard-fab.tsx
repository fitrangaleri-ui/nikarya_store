"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Download,
    Receipt,
    Settings,
    LogOut,
    Grid3X3,
    X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        color: "bg-primary/15 text-primary",
        exact: true,
    },
    {
        label: "Produk Saya",
        href: "/dashboard/products",
        icon: Download,
        color: "bg-emerald-500/15 text-emerald-600",
    },
    {
        label: "Riwayat Pesanan",
        href: "/dashboard/orders",
        icon: Receipt,
        color: "bg-amber-500/15 text-amber-600",
    },
    {
        label: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
        color: "bg-violet-500/15 text-violet-600",
    },
];

export function DashboardFab() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const [open, setOpen] = useState(false);

    // Close on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    const isActive = useCallback(
        (item: (typeof navItems)[0]) => {
            if (item.exact) return pathname === item.href;
            return pathname.startsWith(item.href);
        },
        [pathname],
    );

    const handleSignOut = async () => {
        setOpen(false);
        await signOut();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${open
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Menu Items (expand upward) */}
            <div
                className={`fixed bottom-24 right-5 sm:right-8 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${open
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                {navItems.map((item, index) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-full
                                bg-background/90 backdrop-blur-xl border border-border/50
                                shadow-lg shadow-black/8
                                transition-all duration-200
                                hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                ${active ? "ring-2 ring-primary/30 bg-primary/5" : ""}
                            `}
                            style={{
                                transitionDelay: open ? `${index * 40}ms` : "0ms",
                            }}
                            onClick={() => setOpen(false)}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active ? item.color : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <span
                                className={`text-sm font-medium whitespace-nowrap ${active
                                    ? "text-primary"
                                    : "text-foreground"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout */}
                <button
                    onClick={handleSignOut}
                    className="group flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-full bg-background/90 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/8 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        transitionDelay: open ? `${navItems.length * 40}ms` : "0ms",
                    }}
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-red-500 whitespace-nowrap">
                        Keluar
                    </span>
                </button>
            </div>

            {/* FAB Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`
                    fixed bottom-6 right-5 sm:right-8 z-50
                    w-14 h-14 rounded-full
                    bg-primary text-primary-foreground
                    shadow-lg shadow-primary/25
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    hover:shadow-xl hover:shadow-primary/30 hover:scale-105
                    active:scale-95
                    ${open ? "rotate-45 bg-muted text-foreground shadow-lg shadow-black/10" : ""}
                `}
                aria-label={open ? "Tutup menu" : "Buka navigasi dashboard"}
            >
                {open ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Grid3X3 className="h-5 w-5" />
                )}
            </button>
        </>
    );
}
