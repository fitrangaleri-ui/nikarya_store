"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProduct, updateProduct, deleteGalleryImage } from "./actions";
import { createCategory } from "../categories/actions";
import {
  PlusIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  TrashIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { DocumentTextIcon as DocumentTextIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import { MediaPickerDialog } from "./media-picker-dialog";
import { Typography } from "@/components/ui/typography";
import { StickyHeader } from "../sticky-header";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type GalleryImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price?: number | null;
  sku?: string | null;
  demo_link?: string | null;
  demo_links?: { id: string; label: string; url: string; sort_order: number }[];
  tags?: string[] | null;
  category_id: string | null;
  thumbnail_url: string | null;
  drive_file_url: string | null;
  is_active: boolean;
  gallery_images?: GalleryImage[];
};

// Unified image item for the form's image manager
type ImageItem = {
  id: string;
  url: string;           // Display URL (could be blob URL for new uploads)
  file?: File;           // File object for new local uploads
  isExisting: boolean;   // true = already saved in DB/storage
  isMediaUrl: boolean;   // true = selected from media picker (no file upload needed)
  dbId?: string;         // DB record ID for existing gallery images
};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const isEdit = !!product;
  const [slug, setSlug] = useState(product?.slug || "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [categoryList, setCategoryList] = useState(categories);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [, startCategoryTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Unified images state — combines thumbnail + gallery into a single ordered list
  // First image = thumbnail, rest = gallery
  const buildInitialImages = (): ImageItem[] => {
    const items: ImageItem[] = [];

    // Add thumbnail as the first image
    if (product?.thumbnail_url) {
      items.push({
        id: "thumbnail",
        url: product.thumbnail_url,
        isExisting: true,
        isMediaUrl: false,
      });
    }

    // Add gallery images after thumbnail
    if (product?.gallery_images) {
      for (const gImg of product.gallery_images) {
        // Skip if it's the same URL as thumbnail (avoid duplication)
        if (product.thumbnail_url && gImg.image_url === product.thumbnail_url) continue;
        items.push({
          id: `gallery-${gImg.id}`,
          url: gImg.image_url,
          isExisting: true,
          isMediaUrl: false,
          dbId: gImg.id,
        });
      }
    }

    return items;
  };

  const [images, setImages] = useState<ImageItem[]>(buildInitialImages);

  // Demo links state
  const [demoLinks, setDemoLinks] = useState<{ label: string; url: string }[]>(
    product?.demo_links?.map((d) => ({ label: d.label, url: d.url })) || []
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit || !product?.slug) {
      setSlug(generateSlug(e.target.value));
    }
  };

  // Handle multiple file upload
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newItems.push({
        id: `new-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        isExisting: false,
        isMediaUrl: false,
      });
    }

    setImages((prev) => [...prev, ...newItems]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle media picker selection
  const handleMediaSelect = (url: string) => {
    // Check if this URL is already in the list
    if (images.some((img) => img.url === url)) return;

    setImages((prev) => [
      ...prev,
      {
        id: `media-${Date.now()}`,
        url,
        isExisting: false,
        isMediaUrl: true,
      },
    ]);
  };

  // Remove an image
  const handleRemoveImage = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    // If it's an existing gallery image in DB, delete from server
    if (image.isExisting && image.dbId) {
      startDeleteTransition(async () => {
        const result = await deleteGalleryImage(image.dbId!);
        if (result?.success) {
          setImages((prev) => prev.filter((img) => img.id !== imageId));
        }
      });
    } else {
      // Clean up blob URL for local uploads
      if (image.file) {
        URL.revokeObjectURL(image.url);
      }
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const handleAddCategory = async (formData: FormData) => {
    startCategoryTransition(async () => {
      const result = await createCategory(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        const name = formData.get("name") as string;
        const newCat = {
          id: crypto.randomUUID(),
          name,
          slug: generateSlug(name),
        };
        setCategoryList((prev) => [...prev, newCat]);
        setCategoryDialogOpen(false);
      }
    });
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("isActive", isActive ? "on" : "off");

    // Build the images data:
    // - First image = thumbnail
    // - Rest = gallery images
    const firstImage = images[0];
    const restImages = images.slice(1);

    // Handle thumbnail (first image)
    if (firstImage) {
      if (firstImage.file) {
        // New file upload — set the thumbnail field
        formData.set("thumbnail", firstImage.file);
      } else if (firstImage.url) {
        // Existing URL or media URL — pass as existingThumbnail
        formData.set("existingThumbnail", firstImage.url);
      }
    }

    // Handle gallery images (2nd image onwards)
    // Separate into: new files to upload, existing URLs to keep, media URLs to register
    const galleryFiles: File[] = [];
    const existingGalleryUrls: string[] = [];
    const mediaGalleryUrls: string[] = [];

    for (const img of restImages) {
      if (img.file) {
        galleryFiles.push(img.file);
      } else if (img.isExisting) {
        existingGalleryUrls.push(img.url);
      } else if (img.isMediaUrl) {
        mediaGalleryUrls.push(img.url);
      }
    }

    // Append gallery files
    for (const file of galleryFiles) {
      formData.append("galleryFiles", file);
    }

    // Append existing gallery URLs and media URLs as JSON
    formData.set("existingGalleryUrls", JSON.stringify(existingGalleryUrls));
    formData.set("mediaGalleryUrls", JSON.stringify(mediaGalleryUrls));

    startTransition(async () => {
      if (isEdit) {
        const result = await updateProduct(product.id, formData);
        if (result?.error) setError(result.error);
      } else {
        const result = await createProduct(formData);
        if (result?.error) setError(result.error);
      }
    });
  }

  // Common Input Class untuk Form (dipisah agar konsisten)
  const inputClass =
    "w-full rounded-sm border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all";

  return (
    <div className="pb-28 md:pb-10 w-full max-w-full">
      <StickyHeader
        title={isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        description={isEdit
          ? "Perbarui detail dan publikasi produk Anda dengan mudah."
          : "Mulai buat produk digital baru yang memukau hari ini."}
        backHref="/admin/products"
      />

      <div className="p-4 sm:p-6 md:p-8">
        <form
          action={handleSubmit}
          className="grid gap-5 md:gap-6 lg:grid-cols-3 items-start"
        >
          {/* ══════════════════════════════
            Kolom Kiri - Informasi Utama
            ══════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            {/* ── Informasi Dasar ── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
                <Typography variant="h6" as="h2" className="text-white font-bold">
                  Informasi Dasar
                </Typography>
              </div>

              <div className="p-5 md:p-7 space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-foreground font-bold">
                    Nama Produk
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={product?.title || ""}
                    onChange={handleTitleChange}
                    required
                    placeholder="Misal: Undangan Pernikahan Digital"
                    className={`h-11 ${inputClass}`}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="slug" className="text-foreground font-bold">
                    Slug (URL)
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="nama-produk"
                    className={`h-11 ${inputClass}`}
                  />
                  <Typography variant="caption" color="muted" className="ml-1 font-medium">
                    Auto-generated dari nama produk, tetap bisa diubah manual.
                  </Typography>
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="description"
                    className="text-foreground font-bold"
                  >
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description || ""}
                    rows={5}
                    placeholder="Jelaskan detail dan fitur produk Anda..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ── Harga & Inventaris ── */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-7">
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h6" as="h2">
                  Harga &amp; Inventaris
                </Typography>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="price" className="text-foreground font-bold">
                    Harga Reguler (Rp)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    defaultValue={product?.price || ""}
                    required
                    placeholder="50000"
                    className={`h-11 ${inputClass}`}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label
                    htmlFor="discountPrice"
                    className="text-foreground font-bold"
                  >
                    Harga Coret / Diskon{" "}
                    <span className="font-medium text-muted-foreground text-xs ml-1">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    min="0"
                    step="1000"
                    defaultValue={product?.discount_price || ""}
                    placeholder="Contoh: 75000"
                    className={`h-11 ${inputClass}`}
                  />
                  <Typography variant="caption" color="muted" className="ml-1 font-medium">
                    Isi jika sedang diskon (harga asli sebelum diskon).
                  </Typography>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="sku" className="text-foreground font-bold">
                    SKU (Kode Produk)
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={product?.sku || ""}
                    placeholder="Contoh: WED-001"
                    className={`h-11 uppercase ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            {/* ── File & Demo ── */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-7">
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h6" as="h2">
                  File &amp; Demo
                </Typography>
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="driveFileUrl"
                  className="text-foreground font-bold"
                >
                  Google Drive Link (Produk Utama)
                </Label>
                <Input
                  id="driveFileUrl"
                  name="driveFileUrl"
                  type="url"
                  defaultValue={product?.drive_file_url || ""}
                  placeholder="https://drive.google.com/file/d/..."
                  className={`h-11 ${inputClass}`}
                />
                <Typography variant="caption" color="muted" className="ml-1 font-medium">
                  Link download file asli yang akan diterima pembeli setelah
                  bayar.
                </Typography>
              </div>

              <div className="space-y-2.5">
                <Label className="text-foreground font-bold">
                  Demo Preview Links{" "}
                  <span className="font-medium text-muted-foreground text-xs ml-1">
                    (Opsional)
                  </span>
                </Label>

                {/* Hidden input to serialize demo links as JSON */}
                <input
                  type="hidden"
                  name="demoLinks"
                  value={JSON.stringify(demoLinks)}
                />

                <div className="space-y-3">
                  {demoLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-sm border border-border/50 bg-background/30 p-3"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={`Label (mis: Demo ${index + 1})`}
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...demoLinks];
                            updated[index] = { ...updated[index], label: e.target.value };
                            setDemoLinks(updated);
                          }}
                          className={`h-9 ${inputClass}`}
                        />
                        <div className="relative">
                          <ArrowTopRightOnSquareIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://preview-undangan.com/..."
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...demoLinks];
                              updated[index] = { ...updated[index], url: e.target.value };
                              setDemoLinks(updated);
                            }}
                            className={`h-9 pl-11 ${inputClass}`}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDemoLinks(demoLinks.filter((_, i) => i !== index));
                        }}
                        className="mt-1 p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDemoLinks([
                        ...demoLinks,
                        { label: "", url: "" },
                      ])
                    }
                    className="w-full rounded-full border-dashed border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5"
                  >
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Tambah Demo Link
                  </Button>
                </div>

                <Typography variant="caption" color="muted" className="ml-1 font-medium">
                  Tambahkan satu atau lebih link live preview agar pembeli bisa mencoba dulu.
                </Typography>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
            Kolom Kanan - Organisasi & Gambar
            ══════════════════════════════════ */}
          <div className="space-y-5 md:space-y-6">
            {/* ── Status & Organisasi ── */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-7">
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h6" as="h2">
                  Organisasi
                </Typography>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-sm border border-border/50 bg-background/50 px-4 py-3">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-foreground cursor-pointer">
                    Status Aktif
                  </Label>
                  <Typography variant="caption" color="muted" className="font-medium">
                    Tampilkan di toko
                  </Typography>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-2.5">
                <Label className="text-foreground font-bold">Kategori</Label>
                <div className="flex gap-2">
                  <Select
                    name="categoryId"
                    defaultValue={product?.category_id || ""}
                  >
                    <SelectTrigger
                      className={`flex-1 h-11 ${inputClass} shadow-none`}
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                      {categoryList.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          className="rounded-xl cursor-pointer"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog
                    open={categoryDialogOpen}
                    onOpenChange={setCategoryDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 flex-shrink-0 rounded-full border-border/50 bg-background/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl p-6 sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-foreground font-black tracking-tight mb-2">
                          Tambah Kategori
                        </DialogTitle>
                      </DialogHeader>
                      <form action={handleAddCategory} className="space-y-5">
                        <div className="space-y-2.5">
                          <Label
                            htmlFor="catName"
                            className="text-foreground font-bold"
                          >
                            Nama Kategori
                          </Label>
                          <Input
                            id="catName"
                            name="name"
                            required
                            placeholder="Contoh: E-Books"
                            className={`h-11 ${inputClass}`}
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="brand"
                          size="lg"
                          className="w-full rounded-xl"
                        >
                          Simpan Kategori
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2.5">
                <Label htmlFor="tags" className="text-foreground font-bold">
                  Tags (Label)
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={product?.tags?.join(", ") || ""}
                  placeholder="wedding, luxury, gold"
                  className={`h-11 ${inputClass}`}
                />
                <Typography variant="caption" color="muted" className="ml-1 font-medium">
                  Pisahkan dengan koma (contoh: tag1, tag2).
                </Typography>
              </div>
            </div>

            {/* ══════════════════════════════════
              Unified: Gambar Produk
              Gambar pertama = thumbnail, sisanya = galeri
              ══════════════════════════════════ */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-7">
              <div className="flex items-center justify-between mb-1">
                <Typography variant="h6" as="h2">
                  Gambar Produk
                </Typography>
                {images.length > 0 && (
                  <Typography variant="caption" color="muted" className="font-semibold">
                    {images.length} gambar
                  </Typography>
                )}
              </div>

              <Typography variant="caption" color="muted" className="font-medium !mt-0">
                Gambar pertama akan menjadi thumbnail utama. Anda bisa menambahkan
                beberapa gambar sekaligus.
              </Typography>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className={`group/img relative aspect-square rounded-sm overflow-hidden border bg-muted/30 ${
                        index === 0
                          ? "border-primary/50 ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={index === 0 ? "Thumbnail" : `Gallery ${index}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 120px"
                      />

                      {/* Thumbnail badge */}
                      {index === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-primary/90 px-2 py-1 text-center">
                          <Typography
                            variant="caption"
                            as="span"
                            className="text-primary-foreground font-bold text-[10px] uppercase tracking-wider"
                          >
                            Thumbnail
                          </Typography>
                        </div>
                      )}

                      {/* Media badge */}
                      {img.isMediaUrl && !img.isExisting && (
                        <div className="absolute top-1 left-1">
                          <div className="bg-primary/80 backdrop-blur-sm rounded-full p-1">
                            <Square2StackIcon className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        disabled={isDeleting}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 backdrop-blur-sm text-destructive-foreground flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {images.length === 0 && (
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-border/50 bg-background/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                    <PhotoIcon className="h-8 w-8 mb-1" />
                    <Typography variant="caption" as="span" color="muted" className="font-semibold">
                      Belum ada gambar
                    </Typography>
                  </div>
                </div>
              )}

              {/* Action buttons: Upload + Media */}
              <div className="grid grid-cols-2 gap-2">
                <label
                  htmlFor="image-upload"
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-border/50 bg-background/50 h-11 px-4 text-sm font-bold text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:border-primary/30 ${isPending ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Upload
                </label>
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-border/50 bg-background/50 h-11 px-4 text-sm font-bold text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  <Square2StackIcon className="h-4 w-4" />
                  Media
                </button>
              </div>

              {/* Hidden file input — multiple */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                ref={fileInputRef}
                className="hidden"
              />

              <Typography variant="caption" color="muted" align="center" className="font-medium">
                Upload multiple gambar sekaligus • PNG, JPG, WebP — Max 2MB/gambar
              </Typography>

              {/* Media Picker Dialog */}
              <MediaPickerDialog
                open={mediaPickerOpen}
                onOpenChange={setMediaPickerOpen}
                onSelect={handleMediaSelect}
              />
            </div>

            {/* ── Desktop Action Buttons ── */}
            <div className="hidden md:flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full rounded-full"
                disabled={isPending}
              >
                {isPending
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Terbitkan Produk"}
              </Button>
              <Link href="/admin/products" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-border bg-surface-2"
                >
                  Batal
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Mobile Sticky Bottom Bar ── */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border px-4 pt-3 pb-6 flex gap-3">
            <Link href="/admin/products" className="flex-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-full bg-surface-2"
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="flex-[2] rounded-full"
              disabled={isPending}
            >
              {isPending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Terbitkan Produk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
