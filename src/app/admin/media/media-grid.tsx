"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { deleteMedia, uploadMedia } from "./actions";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";


export type MediaItem = {
  id: string;
  type:
  | "gallery"
  | "product_thumbnail"
  | "product_video"
  | "category_thumbnail"
  | "demo_link"
  | "multiple"
  | "unused"
  | string;
  product_id: string | null;
  product_title: string;
  image_url: string;
  created_at: string;
  size?: number;
  file_name?: string;
  usages_types?: string[];
  usages_details?: {
    type: string;
    id: string;
    title: string;
  }[];
};

/* ── Type Badge color map ── */
const TYPE_BADGE_STYLE: Record<string, string> = {
  gallery: "bg-chart-1/80 text-primary-foreground",
  product_thumbnail: "bg-chart-5/80 text-primary-foreground",
  product_video: "bg-primary text-primary-foreground",
  category_thumbnail: "bg-warning/80 text-warning-foreground",
  demo_link: "bg-chart-2/80 text-primary-foreground",
  multiple: "bg-chart-5/80 text-primary-foreground",
  unused: "bg-destructive/80 text-destructive-foreground",
};

const TYPE_LABEL: Record<string, string> = {
  gallery: "Galeri",
  product_thumbnail: "Thumb Produk",
  product_video: "Video Produk",
  category_thumbnail: "Kategori",
  demo_link: "Demo Link",
  multiple: "Ganda",
  unused: "Unused",
};

const getBadgeText = (item: MediaItem) => {
  if (item.usages_types && item.usages_types.length > 1) {
    return item.usages_types.map((t) => TYPE_LABEL[t] || t).join(" + ");
  }
  return TYPE_LABEL[item.type] || item.type;
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
      className={`group relative overflow-hidden flex flex-col rounded-xl border transition-all duration-300 ${isBroken
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
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isBroken ? "opacity-20 grayscale" : ""
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
            className={`text-[9px] font-bold  tracking-wider border-none backdrop-blur-md ${TYPE_BADGE_STYLE[item.type] || "bg-muted/60 text-foreground"
              }`}
          >
            {getBadgeText(item)}
          </Badge>


          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Copy Link Icon Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-none transition-transform hover:scale-105"
                >
                  {isCopied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <LinkIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  {isCopied ? "Link Tersalin!" : "Salin Link URL"}
                </Typography>
              </TooltipContent>
            </Tooltip>

            {/* Open External Link Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-none transition-transform hover:scale-105"
                  asChild
                >
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Buka di tab baru
                </Typography>
              </TooltipContent>
            </Tooltip>

            {/* Delete Button */}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 rounded-full transition-transform hover:scale-105"
                      disabled={isPending}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <Typography variant="caption" className="font-semibold text-primary-foreground">
                    Hapus Media
                  </Typography>
                </TooltipContent>
              </Tooltip>

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
                <CheckIcon className="h-3.5 w-3.5 text-success" />
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
              className={`text-[10px] font-normal  tracking-wider border-none backdrop-blur-md shrink-0 ${TYPE_BADGE_STYLE[item.type] || "bg-muted/60 text-foreground"
                }`}
            >
              {getBadgeText(item)}
            </Badge>
            <div className="truncate">
              <Typography variant="body-sm" as="h3" className="font-normal truncate text-foreground">
                {item.product_title}
              </Typography>
              <Typography variant="caption" color="muted" className="font-medium truncate block">
                {item.file_name || item.image_url.split("/").pop()}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-9 rounded-full border-border bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-bold gap-1.5"
                >
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <Typography variant="caption" as="span" className="hidden sm:inline font-bold">
                    Salin Link
                  </Typography>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Salin URL ke Clipboard
                </Typography>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-border bg-background/50 hover:bg-muted"
                  asChild
                >
                  <a href={item.image_url} target="_blank" rel="noopener noreferrer">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Buka di tab baru
                </Typography>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Hapus Media
                </Typography>
              </TooltipContent>
            </Tooltip>

            <DialogClose asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <Typography variant="caption" className="font-semibold text-primary-foreground">
                    Tutup Modal
                  </Typography>
                </TooltipContent>
              </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Media Sebelumnya (Panah Kiri)
                </Typography>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Navigation Next Button */}
          {hasNext && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <Typography variant="caption" className="font-semibold text-primary-foreground">
                  Media Berikutnya (Panah Kanan)
                </Typography>
              </TooltipContent>
            </Tooltip>
          )}

        </div>

        {/* Usage Details List if multiple/single usage */}
        {item.usages_details && item.usages_details.length > 0 && (
          <div className="px-5 py-3 sm:px-6 bg-muted/20 border-t border-border/40 flex flex-col gap-1.5 shrink-0">
            <Typography variant="caption" className="font-bold text-foreground">
              Detail Penggunaan ({item.usages_details.length}):
            </Typography>
            <div className="flex flex-wrap gap-2">
              {item.usages_details.map((u, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-background/90 px-2.5 py-1 rounded-md border border-border/60">
                  <Badge className={`text-[9px] font-normal  border-none ${TYPE_BADGE_STYLE[u.type] || "bg-muted/60"}`}>
                    {TYPE_LABEL[u.type] || u.type}
                  </Badge>
                  <Typography variant="caption" className="font-medium text-foreground text-[11px]">
                    {u.title}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Details */}
        <div className="px-5 py-3 sm:px-6 bg-card border-t border-border/60 flex items-center justify-between shrink-0 text-xs font-semibold text-muted-foreground">
          <Typography variant="caption" color="muted" className="font-semibold">
            Diunggah: {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </Typography>
          {item.size !== undefined && item.size > 0 && (
            <Typography variant="caption" className="font-mono bg-muted/60 px-2.5 py-1 rounded text-[11px] font-bold text-foreground">
              {(item.size / 1024).toFixed(1)} KB ({(item.size / (1024 * 1024)).toFixed(2)} MB)
            </Typography>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────── */
/*  MediaUploadDialog                                 */
/* ────────────────────────────────────────────────── */
type SelectedFile = {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
};

function MediaUploadDialog({
  isOpen,
  onClose,
  onUploadSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (items: MediaItem[]) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, startUploadTransition] = useTransition();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const newSelected: SelectedFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 52428800) {
        toast.error(`File "${file.name}" melebihi batas 50MB.`);
        return;
      }
      const isVid = file.type.startsWith("video/") || isVideoFile(file.name);
      newSelected.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: isVid,
      });
    });

    setSelectedFiles((prev) => [...prev, ...newSelected]);
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleClearAll = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFiles(e.dataTransfer.files);
    }
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) return;

    startUploadTransition(async () => {
      const formData = new FormData();
      selectedFiles.forEach((f) => {
        formData.append("files", f.file);
      });

      const res = await uploadMedia(formData);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.uploadedItems) {
        toast.success(
          `${res.uploadedItems.length} file media berhasil diunggah!`
        );
        onUploadSuccess(res.uploadedItems);
        handleClearAll();
        onClose();
      }
    });
  };

  const handleCloseDialog = () => {
    if (isUploading) return;
    handleClearAll();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
      <DialogContent showCloseButton={false} className="rounded-2xl border-border bg-card/95 backdrop-blur-xl p-0 sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
          <div>
            <DialogTitle asChild>
              <Typography variant="h6" as="h2" className="text-white font-bold">
                Upload Media Baru
              </Typography>
            </DialogTitle>
            <DialogDescription asChild>
              <Typography variant="caption" className="text-white/70 font-medium mt-0.5">
                Unggah satu atau beberapa gambar dan video ke Supabase storage.
              </Typography>
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isUploading}
              className="h-8 w-8 rounded-full border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="p-5 md:p-7 space-y-5 overflow-y-auto flex-1">
          {/* Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${isDragOver
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                handleSelectFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <ArrowUpTrayIcon className="h-7 w-7 text-primary" />
            </div>
            <Typography variant="body-sm" as="p" className="font-bold text-foreground">
              Tarik & lepas file di sini, atau{" "}
              <Typography variant="body-sm" as="span" className="text-primary font-bold underline">
                pilih file
              </Typography>
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1 font-medium">
              Mendukung PNG, JPG, WEBP, GIF, SVG, MP4, WEBM (Maks 50MB per file)
            </Typography>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" as="h4" className="font-bold">
                  File Terpilih ({selectedFiles.length})
                </Typography>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isUploading}
                  className="h-7 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm"
                >
                  <Typography variant="caption" as="span" className="font-bold text-destructive">
                    Hapus Semua
                  </Typography>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                {selectedFiles.map((sf) => (
                  <div
                    key={sf.id}
                    className="relative group aspect-square rounded-lg border border-border bg-muted/30 overflow-hidden flex flex-col items-center justify-center"
                  >
                    {sf.isVideo ? (
                      <video
                        src={sf.previewUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={sf.previewUrl}
                        alt={sf.file.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent flex flex-col">
                      <Typography
                        variant="caption"
                        as="span"
                        className="text-white text-[10px] font-bold truncate"
                      >
                        {sf.file.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        as="span"
                        className="text-white/70 text-[9px] font-mono"
                      >
                        {(sf.file.size / 1024).toFixed(0)} KB
                      </Typography>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(sf.id);
                      }}
                      disabled={isUploading}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus file"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 sm:px-7 bg-muted/20 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading}
            className="h-10 rounded-full font-bold border-border"
          >
            <Typography variant="body-sm" as="span" className="font-bold">
              Batal
            </Typography>
          </Button>
          <Button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading || selectedFiles.length === 0}
            className="h-10 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-none px-6 gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <Typography variant="body-sm" as="span" className="font-bold text-primary-foreground">
                  Mengunggah...
                </Typography>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4" />
                <Typography variant="body-sm" as="span" className="font-bold text-primary-foreground">
                  Unggah ({selectedFiles.length})
                </Typography>
              </>
            )}
          </Button>
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);

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

  const handleUploadSuccess = (newItems: MediaItem[]) => {
    setMedia((prev) => {
      const combined = [...newItems, ...prev];
      return combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const filteredMedia = media
    .filter((m) => {
      if (filterType !== "all") {
        if (filterType === "multiple") {
          if (m.type !== "multiple" && (!m.usages_types || m.usages_types.length <= 1)) {
            return false;
          }
        } else {
          const matchesType = m.type === filterType;
          const matchesUsage = m.usages_types && m.usages_types.includes(filterType);
          if (!matchesType && !matchesUsage) return false;
        }
      }
      if (
        search &&
        !m.product_title.toLowerCase().includes(search.toLowerCase()) &&
        !(m.file_name && m.file_name.toLowerCase().includes(search.toLowerCase()))
      )
        return false;
      return true;
    })
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );



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

          <div className="flex w-full sm:w-auto items-center gap-3">
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
                  <SelectItem
                    value="demo_link"
                    className="rounded-xl font-medium cursor-pointer"
                  >
                    Demo Link
                  </SelectItem>
                  <SelectItem value="unused" className="rounded-xl font-medium cursor-pointer">
                    Tidak Terpakai
                  </SelectItem>
                </SelectContent>

              </Select>
            </div>

            <Button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="h-11 rounded-sm bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-none flex items-center gap-2 px-4 shrink-0 transition-all cursor-pointer"
            >
              <CloudArrowUpIcon className="h-5 w-5 text-primary-foreground" />
              <Typography variant="body-sm" as="span" className="font-bold text-primary-foreground hidden sm:inline">
                Upload Media
              </Typography>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredMedia.map((item, index) => (
            <MediaCard
              key={`${item.type}-${item.id}-${item.image_url}`}
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
          <Button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold gap-2 cursor-pointer"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            <Typography variant="body-sm" as="span" className="font-bold text-primary-foreground">
              Upload Media Sekarang
            </Typography>
          </Button>
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

      {/* Upload Media Dialog */}
      <MediaUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
