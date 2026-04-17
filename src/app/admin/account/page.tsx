import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, Calendar, Clock, Globe, Info } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { SecuritySection } from "./security-section";

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
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* ── Header — Primary banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
        <div aria-hidden className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
        <div aria-hidden className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
              <Shield className="w-3 h-3" />
              Pengaturan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Akun
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Kelola profil dan keamanan akun Anda.
            </p>
          </div>

          <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        {/* ── Left Column: Form & Security ── */}
        <div className="space-y-6 md:space-y-8">
          {/* Profile Edit Form */}
          <ProfileForm
            profile={{
              fullName: profile?.full_name || "",
              avatarUrl: profile?.avatar_url || null,
            }}
          />

          {/* Security */}
          <SecuritySection />
        </div>

        {/* ── Right Column: Account Info ── */}
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-border/40">
              <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {/* Email */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Alamat Email
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-row items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                        Hak Akses (Role)
                      </p>
                      <p className="text-sm font-bold text-foreground truncate">
                        Sistem & Dashboard
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3">
                      {profile?.role || "ADMIN"}
                    </Badge>
                  </div>
                </div>

                {/* Login Provider */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Metode Login
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {loginProvider}
                    </p>
                  </div>
                </div>

                {/* Registered Date */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Terdaftar Sejak
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {/* Last Login */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Login Terakhir
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(user.last_sign_in_at)}
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-10 w-10 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      User ID
                    </p>
                    <p className="text-[11px] font-mono font-medium text-muted-foreground break-all bg-background/50 border border-border/50 px-2 py-1 rounded-md inline-block mt-0.5">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
