// ============================================================
// FILE: src/app/dashboard/settings/page.tsx
// PERUBAHAN: Redesign visual — konsisten dengan dashboard/page.tsx
//            Logika & data tidak diubah
// ============================================================

import {
  Settings,
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Sparkles,
} from "lucide-react";
import { getDashboardData } from "../lib";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // ── Data fetching — tidak diubah ──────────────────────────
  const { user, profile } = await getDashboardData();

  const displayName = profile?.full_name || profile?.email || "User";
  const email = profile?.email || user.email || "-";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER BANNER — konsisten dengan dashboard/page.tsx */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        {/* Glass shimmer overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        />
        {/* Stroke border */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        {/* Konten */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-widest mb-3">
              <Settings className="w-3 h-3" />
              Pengaturan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Pengaturan Akun
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Kelola profil dan preferensi akun kamu.
            </p>
          </div>

          {/* Icon dekorasi */}
          <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* PROFIL CARD                                          */}
      {/* ════════════════════════════════════════════════════ */}
      <div>
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-primary block" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Informasi Profil
          </h2>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
          {/* Avatar + nama + email */}
          <div className="flex items-center gap-5 px-6 py-6 border-b border-border/40">
            {/* Avatar inisial besar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-primary">
                  {initial}
                </span>
              </div>
              {/* Dot online */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold text-foreground leading-snug truncate">
                {displayName}
              </p>
              <p className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {email}
              </p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="divide-y divide-border/40">
            {/* Row: Nama */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nama Lengkap
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>

            {/* Row: Email */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Row: Status akun */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Status Akun
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 mt-0.5">
                    Terverifikasi & Aktif
                  </p>
                </div>
              </div>
              {/* Badge status */}
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* COMING SOON — fitur lanjutan                        */}
      {/* ════════════════════════════════════════════════════ */}
      <div>
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-muted-foreground/30 block" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Segera Hadir
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Coming soon: Ubah Password */}
          <div className="relative flex items-center gap-4 rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden opacity-60">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-muted blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Ubah Password</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perbarui kata sandi akun
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full px-2.5 py-1 bg-muted border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Soon
            </span>
          </div>

          {/* Coming soon: Notifikasi */}
          <div className="relative flex items-center gap-4 rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden opacity-60">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-muted blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Notifikasi</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atur preferensi notifikasi
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full px-2.5 py-1 bg-muted border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
