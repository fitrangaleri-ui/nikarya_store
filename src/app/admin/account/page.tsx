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
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Akun
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1.5">
          Kelola profil dan keamanan akun Anda.
        </p>
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
          <Card className="border-border shadow-none bg-background rounded-none">
            <CardHeader className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border">
              <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
                <Info className="h-5 w-5 text-muted-foreground" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {/* Email */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Alamat Email
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Hak Akses (Role)
                    </p>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-none shadow-none font-bold">
                      {profile?.role || "ADMIN"}
                    </Badge>
                  </div>
                </div>

                {/* Login Provider */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Metode Login
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {loginProvider}
                    </p>
                  </div>
                </div>

                {/* Registered Date */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Terdaftar Sejak
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {/* Last Login */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Login Terakhir
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(user.last_sign_in_at)}
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 transition-colors hover:bg-muted/30">
                  <div className="mt-0.5 sm:mt-0 h-9 w-9 rounded-none bg-muted/20 border border-border flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      User ID
                    </p>
                    <p className="text-xs font-mono font-medium text-muted-foreground break-all">
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
