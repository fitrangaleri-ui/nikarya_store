"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { updateProfile } from "./actions";

type ProfileData = {
  fullName: string;
  avatarUrl: string | null;
};

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl("");
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    if (removeAvatar) {
      formData.set("removeAvatar", "true");
    }

    if (profile.avatarUrl && !removeAvatar) {
      formData.set("existingAvatar", profile.avatarUrl);
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-border/40">
        <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="h-4 w-4 text-primary" />
          </div>
          Edit Profil
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 sm:p-8">
        <form action={handleSubmit} className="space-y-7">
          {/* Pesan Error */}
          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-3 animate-in fade-in zoom-in-95">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Pesan Sukses */}
          {success && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary flex items-center gap-3 animate-in fade-in zoom-in-95">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              Profil berhasil diperbarui!
            </div>
          )}

          {/* Avatar Area */}
          <div className="space-y-4">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Foto Profil
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 bg-background/50 border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-border/50 bg-muted/40 flex-shrink-0 shadow-sm">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors z-10 shadow-sm border-2 border-background"
                      aria-label="Hapus Foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                    {profile.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-bold text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all active:scale-[0.98] shadow-sm"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  {previewUrl ? "Ganti Foto" : "Unggah Foto"}
                </label>
                <p className="text-[11px] font-medium text-muted-foreground/70 leading-relaxed max-w-[200px]">
                  Format: PNG, JPG atau JPEG. <br />
                  Ukuran maksimal 2MB.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              id="avatar-upload"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="full_name"
              className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1"
            >
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.fullName}
              placeholder="Masukkan nama lengkap Anda"
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:bg-background transition-all"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-border/40">
            <Button
              type="submit"
              variant="brand"
              className="w-full h-12 rounded-full shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
