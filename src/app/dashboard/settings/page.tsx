import {
  Cog6ToothIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BellIcon,
  LockClosedIcon,
  SparklesIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { getDashboardData } from "../lib";
import { Typography } from "@/components/ui/typography";
import { HeaderBanner } from "../header-banner";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // ── Data fetching — tidak diubah ──────────────────────────
  const { user, profile } = await getDashboardData();

  const displayName = profile?.full_name || "User";
  const email = profile?.email || user.email || "-";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── Banner: Header ── */}
      <HeaderBanner
        title="Pengaturan Akun"
        description="Sesuaikan data diri dan preferensi akun Anda untuk pengalaman yang lebih personal."
        badgeLabel="Akun & Privasi"
        badgeIcon={<Cog6ToothIcon className="w-3.5 h-3.5 text-white" />}
        actionIcon={<SparklesIcon className="w-8 h-8 text-white" />}
      />

      {/* ════════════════════════════════════════════════════ */}
      {/* PROFIL CARD                                          */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-card border border-border  overflow-hidden">
        {/* Avatar + Info Header */}
        <div className="flex items-center gap-6 px-6 py-8 border-b border-border/50 bg-muted/20">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
              <Typography variant="h3" className="text-primary font-black">
                {initial}
              </Typography>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-4 border-card " />
          </div>

          <div className="min-w-0">
            <Typography variant="h5" className="font-bold truncate">
              {displayName}
            </Typography>
            <div className="inline-flex items-center gap-2 mt-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/50">
              <EnvelopeIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <Typography variant="caption" color="muted" className="font-medium truncate">
                {email}
              </Typography>
            </div>
          </div>
        </div>

        {/* Form sections */}
        <div className="divide-y divide-border/50">
          {/* Section: Personal Info */}
          <div className="px-6 py-6 group hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <UserIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <Typography variant="caption" className="font-bold uppercase  text-muted-foreground mb-1">
                    Nama Lengkap
                  </Typography>
                  <Typography variant="body-base" className="font-bold">
                    {displayName}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Account Email */}
          <div className="px-6 py-6 group hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <EnvelopeIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <Typography variant="caption" className="font-bold uppercase  text-muted-foreground mb-1">
                    Alamat Email
                  </Typography>
                  <Typography variant="body-base" className="font-bold">
                    {email}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Section: WhatsApp Number */}
          <div className="px-6 py-6 group hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <PhoneIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <Typography variant="caption" className="font-bold uppercase  text-muted-foreground mb-1">
                    Nomor WhatsApp
                  </Typography>
                  <Typography variant="body-base" className="font-bold">
                    {profile?.phone || "-"}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Security Status */}
          <div className="px-6 py-6 group hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0 border border-success/20 group-hover:bg-success transition-all">
                  <ShieldCheckIcon className="h-5 w-5 text-success group-hover:text-white transition-colors" />
                </div>
                <div>
                  <Typography variant="caption" className="font-bold uppercase  text-muted-foreground mb-1">
                    Status Akun
                  </Typography>
                  <Typography variant="body-base" color="success" className="font-bold">
                    Terverifikasi & Aktif
                  </Typography>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-success/10 border border-success/20">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <Typography variant="caption" className="font-bold text-success uppercase ">
                  Aktif
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* ADDITIONAL FEATURES                                  */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Feature: Security Settings */}
        <ChangePasswordForm email={email} />

        {/* Feature: Notifications */}
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-all opacity-60 grayscale-[0.5]">
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
              <BellIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Typography variant="body-base" className="font-bold">Notifikasi</Typography>
                <div className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50">
                  <Typography variant="caption" className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Soon</Typography>
                </div>
              </div>
              <Typography variant="body-xs" color="muted" className="leading-relaxed">
                Atur preferensi pemberitahuan produk dan promo terbaru.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
