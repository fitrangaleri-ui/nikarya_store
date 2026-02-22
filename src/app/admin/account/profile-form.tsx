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
    <Card className="border-border shadow-none bg-background rounded-none">
      <CardHeader className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border">
        <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
          Edit Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form action={handleSubmit} className="space-y-6">
          {/* Pesan Error */}
          {error && (
            <div className="rounded-none border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-semibold text-destructive flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Pesan Sukses */}
          {success && (
            <div className="rounded-none border border-primary/20 bg-primary/10 p-3.5 text-sm font-semibold text-primary flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Profil berhasil diperbarui!
            </div>
          )}

          {/* Avatar */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground">
              Foto Profil
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border border-border bg-muted/20 flex-shrink-0">
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
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-none bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors z-10"
                      aria-label="Hapus Foto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                    {profile.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted/50 hover:text-primary hover:border-primary/50 transition-colors h-11 active:scale-[0.98]"
                >
                  <Upload className="h-4 w-4" />
                  {previewUrl ? "Ganti Foto" : "Upload Foto"}
                </label>
                <p className="text-xs font-medium text-muted-foreground">
                  Format PNG, JPG — Max 2MB
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
              className="text-sm font-semibold text-muted-foreground"
            >
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.fullName}
              placeholder="Masukkan nama lengkap"
              required
              className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98] disabled:opacity-70"
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
