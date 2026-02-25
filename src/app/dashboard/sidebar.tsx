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

    const isActive = (item: (typeof navItems)[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <>
            {/* ─── Mobile Toggle Button ─── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-20 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-xl dashboard-card text-primary hover:scale-105 transition-all active:scale-95"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* ─── Mobile Overlay (matches cart sidebar pattern) ─── */}
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
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative lg:z-auto
          ${collapsed ? "lg:w-[72px]" : "lg:w-[250px]"}
        `}
            >
                {/* Aksen glow (matches cart sidebar) */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none -z-10" />

                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--glass-border)] flex-shrink-0">
                    {!collapsed && (
                        <span className="text-sm font-bold tracking-wide text-primary truncate">
                            Dashboard
                        </span>
                    )}

                    {/* Mobile Close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors ml-auto"
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
                                <Icon
                                    className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${active
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-primary"
                                        }`}
                                />
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
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Store className="h-3.5 w-3.5" />
                            Kembali ke Toko
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
