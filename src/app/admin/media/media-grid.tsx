"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import {
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  FunnelIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { deleteMedia } from "./actions";
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
  category_thumbnail: "bg-warning/80 text-warning-foreground",
  multiple: "bg-chart-5/80 text-primary-foreground",
  unused: "bg-destructive/80 text-destructive-foreground",
};

const TYPE_LABEL: Record<string, string> = {
  gallery: "Galeri",
  product_thumbnail: "Thumb Produk",
  category_thumbnail: "Kategori",
  multiple: "Thumb & Galeri",
  unused: "Unused",
};

/* ────────────────────────────────────────────────── */
/*  MediaCard                                         */
/* ────────────────────────────────────────────────── */
function MediaCard({
  item,
  onDelete,
}: {
  item: MediaItem;
  onDelete: (id: string, type: string, url: string) => Promise<void>;
}) {
  const [isBroken, setIsBroken] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete(item.id, item.type, item.image_url);
    });
  };

  return (
    <div
      className={`group relative overflow-hidden flex flex-col rounded-xl border transition-all duration-300 ${
        isBroken
          ? "border-destructive/50 bg-destructive/5"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
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

        {/* Broken State Overlay */}
        {isBroken && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-destructive mb-2 opacity-80" />
            <Typography
              variant="caption"
              as="span"
              className="font-bold text-destructive"
            >
              Gambar Rusak
            </Typography>
            <Typography
              variant="caption"
              as="span"
              color="destructive"
              className="mt-1 leading-tight opacity-80"
            >
              File tidak ditemukan atau terhapus
            </Typography>
          </div>
        )}

        {/* Action Overlay */}
        <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge
            className={`text-[9px] font-bold uppercase tracking-wider border-none backdrop-blur-md ${
              TYPE_BADGE_STYLE[item.type] || "bg-muted/60 text-foreground"
            }`}
          >
            {TYPE_LABEL[item.type] || item.type}
          </Badge>

          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground backdrop-blur-md border-none"
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  disabled={isPending}
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
                      Hapus Gambar?
                    </AlertDialogTitle>
                  </div>
                </div>
                <div className="p-5 md:p-7 space-y-5">
                  <AlertDialogDescription className="font-medium text-muted-foreground">
                    Apakah Anda yakin ingin menghapus gambar ini secara permanen
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
      <div className="p-4 flex flex-col flex-1">
        <Typography
          variant="body-sm"
          as="p"
          className="font-bold leading-snug line-clamp-2"
          title={item.product_title}
        >
          {item.product_title}
        </Typography>
        <div className="flex items-center justify-between mt-auto pt-2">
          <Typography
            variant="caption"
            as="p"
            color="muted"
            className="font-medium"
          >
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>
          {item.size !== undefined && item.size > 0 && (
            <Typography
              variant="caption"
              as="p"
              color="muted"
              className="font-mono font-bold bg-muted/50 px-1.5 py-0.5 rounded-sm"
            >
              {(item.size / 1024).toFixed(1)} KB
            </Typography>
          )}
        </div>
      </div>

      {isPending && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
          <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/*  MediaGrid                                         */
/* ────────────────────────────────────────────────── */
export function MediaGrid({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Keep local state in sync if props change (e.g., after server action revalidation)
  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  const handleDeleteMedia = async (id: string, type: string, url: string) => {
    const res = await deleteMedia(id, type, url);
    if (res?.success) {
      // Optimistic update
      setMedia((prev) => prev.filter((m) => !(m.id === id && m.type === type)));
    }
  };

  const filteredMedia = media.filter((m) => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (
      search &&
      !m.product_title.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

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
              placeholder="Cari nama produk..."
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
          {filteredMedia.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              onDelete={handleDeleteMedia}
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
              ? "Tidak ada gambar yang cocok dengan filter pencarian"
              : "Belum ada gambar yang diupload ke server"}
          </Typography>
        </div>
      )}
    </div>
  );
}
