"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Squares2X2Icon,
    color: "bg-primary text-primary-foreground",
    exact: true,
  },
  {
    label: "Produk Saya",
    href: "/dashboard/products",
    icon: ArrowDownTrayIcon,
    color: "bg-success text-success-foreground",
  },
  {
    label: "Riwayat Pesanan",
    href: "/dashboard/orders",
    icon: ClipboardDocumentListIcon,
    color: "bg-warning text-warning-foreground",
  },
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
    color: "bg-primary-soft text-primary-foreground",
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
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Menu Items (expand upward) */}
      <div
        className={cn(
          "fixed bottom-[calc(6.5rem+10%)] right-5 sm:right-8 z-50 flex flex-col items-end gap-3 transition-all duration-300",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {navItems.map((item, index) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 pl-4 pr-6 py-2.5 rounded-full",
                "glass transition-all duration-300",
                "hover:scale-[1.05] active:scale-[0.95]",
                active
                  ? "bg-primary-bg border-primary/30 ring-4 ring-primary/5"
                  : "hover:bg-muted/50"
              )}
              style={{
                transitionDelay: open ? `${index * 50}ms` : "0ms",
              }}
              onClick={() => setOpen(false)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  active
                    ? item.color
                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <Typography
                variant="body-sm"
                className={cn(
                  "font-bold tracking-tight whitespace-nowrap transition-colors",
                  active ? "text-primary" : "text-foreground group-hover:text-primary"
                )}
              >
                {item.label}
              </Typography>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={cn(
            "group flex items-center gap-3 pl-4 pr-6 py-2.5 rounded-full",
            "glass transition-all duration-300",
            "hover:scale-[1.05] active:scale-[0.95] hover:bg-destructive/10"
          )}
          style={{
            transitionDelay: open ? `${navItems.length * 50}ms` : "0ms",
          }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-300">
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          </div>
          <Typography
            variant="body-sm"
            className="font-bold tracking-tight text-destructive whitespace-nowrap group-hover:text-destructive"
          >
            Keluar
          </Typography>
        </button>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-[calc(1.5rem+10%)] right-5 sm:right-8 z-50",
          "w-16 h-16 rounded-full shadow-elevation-lg",
          "flex items-center justify-center",
          "transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)",
          "hover:scale-110 active:scale-90",
          open
            ? "bg-background text-foreground border border-border/50 rotate-90"
            : "bg-primary text-primary-foreground"
        )}
        aria-label={open ? "Tutup menu" : "Buka navigasi dashboard"}
      >
        {open ? (
          <XMarkIcon className="h-8 w-8 transition-transform duration-500" />
        ) : (
          <Squares2X2Icon className="h-7 w-7 transition-transform duration-500" />
        )}
      </button>
    </>
  );
}
