"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { fetchMediaForPicker, type MediaPickerItem } from "./fetch-media";

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (payload: { type: "url"; url: string } | { type: "files"; files: File[] }) => void;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: MediaPickerDialogProps) {
  const [media, setMedia] = useState<MediaPickerItem[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch media when dialog opens
  useEffect(() => {
    if (open && !hasLoaded) {
      startTransition(async () => {
        const items = await fetchMediaForPicker();
        setMedia(items);
        setHasLoaded(true);
      });
    }
    // Reset selection when dialog closes
    if (!open) {
      setSelectedUrl(null);
      setSearch("");
    }
  }, [open, hasLoaded]);

  const filteredMedia = media.filter((m) =>
    m.file_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect({ type: "url", url: selectedUrl });
      onOpenChange(false);
    }
  };

  const handleLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelect({ type: "files", files: Array.from(e.target.files) });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl p-0 sm:max-w-2xl md:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6 shrink-0">
          <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-primary" />
            Pilih dari Media
          </DialogTitle>
          <Typography
            variant="caption"
            color="muted"
            className="font-medium mt-1"
          >
            Pilih gambar yang sudah ada di galeri media untuk dijadikan
            thumbnail.
          </Typography>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pt-4 pb-0 sm:px-6 shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg border-border bg-background text-sm font-semibold shadow-none focus:bg-background"
            />
          </div>
        </div>

        {/* Grid / Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Typography
                variant="body-sm"
                color="muted"
                className="font-semibold"
              >
                Memuat galeri media...
              </Typography>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <PhotoIcon className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <Typography
                variant="body-sm"
                className="font-bold"
              >
                {search
                  ? "Tidak ada hasil"
                  : "Belum ada media"}
              </Typography>
              <Typography
                variant="caption"
                color="muted"
                className="font-medium max-w-[250px] text-center"
              >
                {search
                  ? "Tidak ada gambar yang cocok dengan pencarian"
                  : "Upload gambar terlebih dahulu melalui halaman Media"}
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
              {filteredMedia.map((item) => {
                const isSelected = selectedUrl === item.image_url;
                return (
                  <button
                    key={item.file_name}
                    type="button"
                    onClick={() =>
                      setSelectedUrl(
                        isSelected ? null : item.image_url
                      )
                    }
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected
                        ? "border-primary ring-2 ring-primary/20 scale-[0.97]"
                        : "border-border hover:border-primary/40"
                      }`}
                  >
                    <Image
                      src={item.image_url}
                      alt={item.file_name}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                      className={`object-cover transition-all duration-300 ${isSelected
                          ? "brightness-75"
                          : "group-hover:scale-105"
                        }`}
                    />

                    {/* Selection overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                        <CheckCircleSolid className="h-8 w-8 text-primary drop-shadow-lg" />
                      </div>
                    )}

                    {/* File name tooltip on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Typography
                        variant="caption"
                        as="span"
                        className="text-white font-semibold line-clamp-1 text-[10px] leading-tight"
                      >
                        {item.file_name}
                      </Typography>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-muted/30 px-5 py-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Typography
            variant="caption"
            color="muted"
            className="font-semibold"
          >
            {filteredMedia.length} gambar tersedia
            {selectedUrl && (
              <span className="text-primary ml-2">• 1 dipilih</span>
            )}
          </Typography>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("media-picker-upload")?.click()}
              className="rounded-full border-border bg-background px-4 hover:border-primary/50 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload dari Komputer
            </Button>
            <input
              id="media-picker-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleLocalFiles}
            />

            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="rounded-full px-5"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />
              Gunakan Gambar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-full border-border bg-background px-4"
            >
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
