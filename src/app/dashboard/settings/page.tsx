import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Mail, Shield } from "lucide-react";
import { getDashboardData } from "../lib";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const { user, profile } = await getDashboardData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    Pengaturan
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Kelola profil dan preferensi akun Anda.
                </p>
            </div>

            {/* Profile Info */}
            <Card className="dashboard-card border-0">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Informasi Profil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-foreground text-lg">
                                {profile?.full_name || "User"}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3.5 w-3.5" />
                                {profile?.email || user.email || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/50 text-emerald-700 text-sm">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span>Akun Anda terverifikasi dan aktif.</span>
                    </div>
                </CardContent>
            </Card>

            {/* Coming Soon */}
            <Card className="dashboard-card border-0">
                <CardContent className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Settings className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                        Segera Hadir
                    </h3>
                    <p className="mt-1 text-muted-foreground max-w-sm mx-auto">
                        Fitur pengaturan lanjutan seperti ubah password, notifikasi, dan
                        preferensi akan segera tersedia.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
