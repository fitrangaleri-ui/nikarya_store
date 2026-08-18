"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import {
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  FunnelIcon,
  PhotoIcon,
  VideoCameraIcon,
  PlayIcon,
  LinkIcon,
  CheckIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { deleteMedia } from "./actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type MediaItem = {
  id: string;
  type:
    | "gallery"
    | "product_thumbnail"
    | "product_video"
    | "category_thumbnail"
    | "unused"
    | string;
  product_id: string | null;
  product_title: string;
  image_url: string;
  created_at: string;
  size?: number;
  file_name?: string;
};

/* ── Type Badge color map ── */
const TYPE_BADGE_STYLE: Record<string, string> = {
  gallery: "bg-chart-1/80 text-primary-foreground",
  product_thumbnail: "bg-chart-5/80 text-primary-foreground",
  product_video: "bg-primary text-primary-foreground",
  category_thumbnail: "bg-warning/80 text-warning-foreground",
  multiple: "bg-chart-5/80 text-primary-foreground",
  unused: "bg-destructive/80 text-destructive-foreground",
};

const TYPE_LABEL: Record<string, string> = {
  gallery: "Galeri",
  product_thumbnail: "Thumb Produk",
  product_video: "Video Produk",
  category_thumbnail: "Kategori",
  multiple: "Thumb & Galeri",
  unused: "Unused",
};

const isVideoFile = (url: string, fileName?: string) => {
  const cleanUrl = (fileName || url).split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".m4v")
  );
};

/* ────────────────────────────────────────────────── */
/*  MediaCard                                         */
/* ────────────────────────────────────────────────── */
function MediaCard({
  item,
  onDelete,
  onOpenLightbox,
}: {
  item: MediaItem;
  onDelete: (id: string, type: string, url: string) => Promise<void>;
  onOpenLightbox: () => void;
}) {
  const [isBroken, setIsBroken] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCopied, setIsCopied] = useState(false);

  const isVideo = isVideoFile(item.image_url, item.file_name) || item.type === "product_video";

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete(item.id, item.type, item.image_url);
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.image_url);
    setIsCopied(true);
    toast.success("Link media berhasil disalin.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`group relative overflow-hidden flex flex-col rounded-xl border transition-all duration-300 ${
        isBroken
          ? "border-destructive/50 bg-destructive/5"
          : "border-border bg-card hover:border-primary/40 hover:shadow-lg"
      }`}
    >
      {/* Image / Video Container (Click to Lightbox) */}
      <div
        onClick={onOpenLightbox}
        className="relative aspect-square w-full overflow-hidden bg-muted/30 flex items-center justify-center cursor-pointer"
      >
        {isVideo ? (
          <>
            <video
              src={item.image_url}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              preload="metadata"
              onError={() => setIsBroken(true)}
            />
            {!isBroken && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:bg-black/20 transition-colors">
                <div className="w-11 h-11 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform">
                  <PlayIcon className="h-6 w-6 ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : (
          <Image
            src={item.image_url}
            alt={item.product_title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isBroken ? "opacity-20 grayscale" : ""
            }`}
            onError={() => setIsBroken(true)}
          />
        )}

        {/* Broken State Overlay */}
        {isBroken && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-destructive mb-2 opacity-80" />
            <Typography
              variant="caption"
              as="span"
              className="font-bold text-destructive"
            >
              {isVideo ? "Video Rusak" : "Gambar Rusak"}
            </Typography>
            <Typography
              variant="caption"
              as="span"
              color="destructive"
              className="mt-1 leading-tight opacity-80 text-[10px]"
            >
              File tidak ditemukan atau terhapus
            </Typography>
          </div>
        )}

        {/* Action Overlay */}
        <div className="absolute inset-x-0 top-0 p-2.5 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Badge
            className={`text-[9px] font-bold uppercase tracking-wider border-none backdrop-blur-md ${
              TYPE_BADGE_STYLE[item.type] || "bg-muted/60 text-foreground"
            }`}
          >
            {TYPE_LABEL[item.type] || item.type}
          </Badge>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Copy Link Icon Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyLink}
              title="Salin Link URL"
              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-none transition-transform hover:scale-105"
            >
              {isCopied ? (
                <CheckIcon className="h-3.5 w-3.5 text-success" />
              ) : (
                <LinkIcon className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Open External Link Button */}
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-none transition-transform hover:scale-105"
              asChild
              title="Buka di tab baru"
            >
              <a
                href={item.image_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-full transition-transform hover:scale-105"
                  disabled={isPending}
                  title="Hapus Media"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl sm:max-w-md p-0 gap-0">
                <div className="bg-destructive/10 px-5 py-4 md:px-7 md:py-5 border-b border-destructive/20 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-lg font-bold tracking-tight text-destructive">
                      Hapus Media?
                    </AlertDialogTitle>
                  </div>
                </div>
                <div className="p-5 md:p-7 space-y-5">
                  <AlertDialogDescription className="font-medium text-muted-foreground">
                    Apakah Anda yakin ingin menghapus media ini secara permanen
                    dari server penyimpanan? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                  <AlertDialogFooter className="flex gap-3 sm:justify-end">
                    <AlertDialogCancel className="h-11 rounded-full flex-1 sm:flex-none bg-surface-2 hover:bg-muted font-bold border-border transition-colors">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="h-11 rounded-full flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-none transition-all active:scale-[0.98]"
                    >
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <Typography
            variant="body-sm"
            as="p"
            className="font-bold leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            title={item.product_title}
            onClick={onOpenLightbox}
          >
            {item.product_title}
          </Typography>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <Typography
            variant="caption"
            as="p"
            color="muted"
            className="font-medium text-[11px]"
          >
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Link URL"
              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              {isCopied ? (
                <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              )}
            </button>

            {item.size !== undefined && item.size > 0 && (
              <Typography
                variant="caption"
                as="p"
                color="muted"
                className="font-mono font-bold bg-muted/50 px-1.5 py-0.5 rounded-sm text-[10px]"
              >
                {(item.size / 1024).toFixed(1)} KB
              </Typography>
            )}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
          <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/*  MediaLightboxDialog                               */
/* ────────────────────────────────────────────────── */
function MediaLightboxDialog({
  item,
  onClose,
  onDelete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: MediaItem | null;
  onClose: () => void;
  onDelete: (id: string, type: string, url: string) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, hasPrev, hasNext, onPrev, onNext]);

  if (!item) return null;

  const isVideo = isVideoFile(item.image_url, item.file_name) || item.type === "product_video";

  const handleCopy = () => {
    navigator.clipboard.writeText(item.image_url);
    toast.success("Link media berhasil disalin.");
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await onDelete(item.id, item.type, item.image_url);
      onClose();
    });
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="rounded-2xl border-border bg-card/95 backdrop-blur-2xl p-0 sm:max-w-4xl md:max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <DialogTitle className="sr-only">
          Pratinjau Media - {item.product_title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Tampilan lightbox detail media {item.file_name || item.product_title}
        </DialogDescription>
        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 flex items-center justify-between border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider border-none backdrop-blur-md shrink-0 ${
                TYPE_BADGE_STYLE[item.type] || "bg-muted/60 text-foreground"
              }`}
            >
              {TYPE_LABEL[item.type] || item.type}
            </Badge>
            <div className="truncate">
              <Typography variant="body-sm" as="h3" className="font-bold truncate text-foreground">
                {item.product_title}
              </Typography>
              <Typography variant="caption" color="muted" className="font-medium truncate block">
                {item.file_name || item.image_url.split("/").pop()}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 rounded-full border-border bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-bold gap-1.5"
            >
              <LinkIcon className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Salin Link</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border bg-background/50 hover:bg-muted"
              asChild
            >
              <a href={item.image_url} target="_blank" rel="noopener noreferrer" title="Buka di tab baru">
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Hapus Media"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>

            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Tutup Modal"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Content Viewer with Prev/Next Controls */}
        <div className="relative flex-1 bg-black/90 min-h-[350px] max-h-[70vh] flex items-center justify-center p-4 overflow-hidden select-none">
          {isVideo ? (
            <video
              src={item.image_url}
              controls
              autoPlay
              className="max-h-[64vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          ) : (
            <img
              src={item.image_url}
              alt={item.product_title}
              className="max-h-[64vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          )}

          {/* Navigation Prev Button */}
          {hasPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
              title="Media Sebelumnya (Panah Kiri)"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}

          {/* Navigation Next Button */}
          {hasNext && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
              title="Media Berikutnya (Panah Kanan)"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Footer Details */}
        <div className="px-5 py-3 sm:px-6 bg-card border-t border-border/60 flex items-center justify-between shrink-0 text-xs font-semibold text-muted-foreground">
          <span>
            Diunggah: {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          {item.size !== undefined && item.size > 0 && (
            <span className="font-mono bg-muted/60 px-2.5 py-1 rounded text-[11px] font-bold text-foreground">
              {(item.size / 1024).toFixed(1)} KB ({(item.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────── */
/*  MediaGrid                                         */
/* ────────────────────────────────────────────────── */
export function MediaGrid({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Keep local state in sync if props change (e.g., after server action revalidation)
  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  const handleDeleteMedia = async (id: string, type: string, url: string) => {
    const res = await deleteMedia(id, type, url);
    if (res?.success) {
      setMedia((prev) => prev.filter((m) => !(m.id === id && m.type === type)));
    }
  };

  const filteredMedia = media.filter((m) => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (
      search &&
      !m.product_title.toLowerCase().includes(search.toLowerCase()) &&
      !(m.file_name && m.file_name.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  const activeLightboxItem = lightboxIndex !== null ? filteredMedia[lightboxIndex] : null;
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0;
  const hasNext = lightboxIndex !== null && lightboxIndex < filteredMedia.length - 1;

  const handlePrev = () => {
    if (hasPrev) setLightboxIndex((prev) => (prev !== null ? prev - 1 : null));
  };
  const handleNext = () => {
    if (hasNext) setLightboxIndex((prev) => (prev !== null ? prev + 1 : null));
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary px-5 py-3 md:px-7 md:py-4 border-b border-primary-bg/20">
          <Typography variant="body-sm" as="h3" className="text-white font-bold">
            Filter Media
          </Typography>
        </div>
        <div className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama produk / file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-sm border-border/70 bg-background/50 text-sm font-semibold shadow-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={filterType}
              onValueChange={(val: string) => setFilterType(val)}
            >
              <SelectTrigger className="h-11 rounded-sm border-border/70 bg-background/50 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                <SelectItem value="all" className="rounded-xl font-medium cursor-pointer">
                  Semua Tipe
                </SelectItem>
                <SelectItem value="multiple" className="rounded-xl font-medium cursor-pointer">
                  Thumbnail & Galeri
                </SelectItem>
                <SelectItem value="gallery" className="rounded-xl font-medium cursor-pointer">
                  Galeri Produk
                </SelectItem>
                <SelectItem
                  value="product_thumbnail"
                  className="rounded-xl font-medium cursor-pointer"
                >
                  Thumbnail Produk
                </SelectItem>
                <SelectItem
                  value="product_video"
                  className="rounded-xl font-medium cursor-pointer"
                >
                  Video Produk
                </SelectItem>
                <SelectItem
                  value="category_thumbnail"
                  className="rounded-xl font-medium cursor-pointer"
                >
                  Gambar Kategori
                </SelectItem>
                <SelectItem value="unused" className="rounded-xl font-medium cursor-pointer">
                  Tidak Terpakai
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredMedia.map((item, index) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              onDelete={handleDeleteMedia}
              onOpenLightbox={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-xl border-2 border-dashed border-border bg-card/30">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex flex-col items-center justify-center mb-3">
            <PhotoIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <Typography variant="body-base" className="font-bold">
            Tidak ada media
          </Typography>
          <Typography
            variant="body-sm"
            color="muted"
            className="mt-1 max-w-[250px] font-medium"
          >
            {search || filterType !== "all"
              ? "Tidak ada gambar atau video yang cocok dengan filter pencarian"
              : "Belum ada media yang diupload ke server"}
          </Typography>
        </div>
      )}

      {/* Visual Lightbox Dialog */}
      <MediaLightboxDialog
        item={activeLightboxItem}
        onClose={() => setLightboxIndex(null)}
        onDelete={handleDeleteMedia}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
}
