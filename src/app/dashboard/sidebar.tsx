"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Download,
    Receipt,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Store,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Produk Saya",
        href: "/dashboard/products",
        icon: Download,
    },
    {
        label: "Riwayat Pesanan",
        href: "/dashboard/orders",
        icon: Receipt,
    },
    {
        label: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const isActive = (item: (typeof navItems)[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <>
            {/* ─── Mobile Toggle Button (single hamburger, positioned in content area) ─── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-[92px] md:top-[104px] left-4 z-40 flex items-center justify-center w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm text-primary hover:bg-primary/10 transition-all active:scale-95"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* ─── Mobile Overlay ─── */}
            <div
                className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            {/* ─── Sidebar ─── */}
            <aside
                className={`
                    dashboard-sidebar flex flex-col
                    fixed top-0 left-0 h-dvh z-50
                    transition-all duration-300 ease-out
                    w-[280px]
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:relative lg:z-auto
                    ${collapsed ? "lg:w-[72px]" : "lg:w-[250px]"}
                `}
            >
                {/* Glow accent */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none -z-10" />

                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--glass-border)] flex-shrink-0">
                    {!collapsed && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-bold tracking-wide text-foreground truncate">
                                Dashboard
                            </span>
                        </div>
                    )}

                    {/* Mobile Close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors ml-auto"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-200
                                    ${active
                                        ? "bg-primary/15 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                                    }
                                    ${collapsed ? "justify-center px-2" : ""}
                                `}
                                title={collapsed ? item.label : undefined}
                            >
                                {/* Wrapped icon inside styled container */}
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${active
                                        ? "bg-primary/15"
                                        : "bg-muted/50 group-hover:bg-primary/10"
                                        }`}
                                >
                                    <Icon
                                        className={`h-[16px] w-[16px] transition-colors ${active
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-primary"
                                            }`}
                                    />
                                </div>
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className="px-4 py-3 border-t border-[var(--glass-border)] flex-shrink-0">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <div className="w-7 h-7 rounded-md bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Store className="h-3.5 w-3.5" />
                            </div>
                            Kembali ke Toko
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
