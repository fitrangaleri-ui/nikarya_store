import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { SecuritySection } from "./security-section";
import { StickyHeader } from "../sticky-header";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Get or create profile
  let { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: created } = await admin
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: "",
        role: "ADMIN",
      })
      .select()
      .single();
    profile = created;
  }

  const formatDate = (dateStr: string | null | undefined) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

  const loginProvider =
    user.app_metadata?.provider === "google" ? "Google" : "Email";

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header ── */}
      <StickyHeader
        title="Akun"
        description="Kelola profil dan keamanan akun Anda."
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </StickyHeader>

      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Edit Form */}
        <ProfileForm
          profile={{
            fullName: profile?.full_name || "",
            avatarUrl: profile?.avatar_url || null,
          }}
        />

        {/* Security */}
        <SecuritySection />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <InformationCircleIcon className="h-4 w-4 text-white" />
            </div>
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Informasi Akun
            </Typography>
          </div>
          <div className="divide-y divide-border/40">
            {/* Email */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                  Alamat Email
                </Typography>
                <Typography variant="body-sm" as="p" className="font-bold truncate">
                  {user.email}
                </Typography>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 flex flex-row items-center justify-between">
                <div>
                  <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                    Hak Akses (Role)
                  </Typography>
                  <Typography variant="body-sm" as="p" className="font-bold truncate">
                    Sistem &amp; Dashboard
                  </Typography>
                </div>
                <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3">
                  {profile?.role || "ADMIN"}
                </Badge>
              </div>
            </div>

            {/* Login Provider */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                  Metode Login
                </Typography>
                <Typography variant="body-sm" as="p" className="font-bold">
                  {loginProvider}
                </Typography>
              </div>
            </div>

            {/* Registered Date */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                  Terdaftar Sejak
                </Typography>
                <Typography variant="body-sm" as="p" className="font-bold">
                  {formatDate(user.created_at)}
                </Typography>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                  Login Terakhir
                </Typography>
                <Typography variant="body-sm" as="p" className="font-bold">
                  {formatDate(user.last_sign_in_at)}
                </Typography>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                <FingerPrintIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="caption" as="p" color="muted" className="font-bold uppercase  mb-0.5">
                  User ID
                </Typography>
                <Typography variant="caption" as="p" color="muted" className="font-mono font-medium break-all bg-background/50 border border-border/50 px-2 py-1 rounded-sm inline-block mt-0.5">
                  {user.id}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
