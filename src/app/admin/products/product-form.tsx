"use client";

import { useState, useTransition } from "react";
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
import { createProduct, updateProduct } from "./actions";
import { createCategory } from "../categories/actions";
import {
  Plus,
  ArrowLeft,
  Upload,
  ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  slug: string;
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
  tags?: string[] | null;
  category_id: string | null;
  thumbnail_url: string | null;
  drive_file_url: string | null;
  is_active: boolean;
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
  const [previewUrl, setPreviewUrl] = useState(product?.thumbnail_url || "");
  const [categoryList, setCategoryList] = useState(categories);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [, startCategoryTransition] = useTransition();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
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
    if (product?.thumbnail_url && previewUrl === product.thumbnail_url) {
      formData.set("existingThumbnail", product.thumbnail_url);
    }

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

  return (
    <div className="pb-28 md:pb-0">
      {/* ── Header — selaras dengan section heading homepage ── */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Produk
        </Link>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? "Perbarui informasi produk di bawah ini."
            : "Lengkapi informasi produk baru di bawah ini."}
        </p>
      </div>

      <form
        action={handleSubmit}
        className="grid max-w-4xl gap-5 md:gap-8 lg:grid-cols-3"
      >
        {/* ══════════════════════════════
            Kolom Kiri - Informasi Utama
            ══════════════════════════════ */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {error && (
            <div className="border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          {/* ── Informasi Dasar ── */}
          <div className="space-y-4 border border-border bg-card p-4 md:p-6 shadow-none">
            {/* Accent bar — pola dari section "Baru Rilis" homepage */}
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 bg-primary block flex-shrink-0" />
              <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                Informasi Dasar
              </h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium">
                Nama Produk
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={product?.title || ""}
                onChange={handleTitleChange}
                required
                placeholder="Nama produk"
                className="h-11 rounded-none border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-foreground font-medium">
                Slug (URL)
              </Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="nama-produk"
                className="h-11 rounded-none border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated dari nama produk, tetap bisa diubah manual.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-foreground font-medium"
              >
                Deskripsi
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description || ""}
                rows={5}
                placeholder="Deskripsi produk..."
                className="rounded-none border-border bg-background text-foreground"
              />
            </div>
          </div>

          {/* ── Harga & Inventaris ── */}
          <div className="space-y-4 border border-border bg-card p-4 md:p-6 shadow-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 bg-primary block flex-shrink-0" />
              <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                Harga &amp; Inventaris
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground font-medium">
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
                  className="h-11 rounded-none border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="discountPrice"
                  className="text-foreground font-medium"
                >
                  Harga Coret / Diskon{" "}
                  <span className="font-normal text-muted-foreground">
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
                  className="h-11 rounded-none border-border bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Isi jika produk sedang diskon (harga asli sebelum diskon).
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-foreground font-medium">
                  SKU (Kode Produk)
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku || ""}
                  placeholder="Contoh: WED-001"
                  className="h-11 rounded-none border-border bg-background text-foreground uppercase"
                />
              </div>
            </div>
          </div>

          {/* ── File & Demo ── */}
          <div className="space-y-4 border border-border bg-card p-4 md:p-6 shadow-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 bg-primary block flex-shrink-0" />
              <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                File &amp; Demo
              </h2>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="driveFileUrl"
                className="text-foreground font-medium"
              >
                Google Drive Link (Produk Utama)
              </Label>
              <Input
                id="driveFileUrl"
                name="driveFileUrl"
                type="url"
                defaultValue={product?.drive_file_url || ""}
                placeholder="https://drive.google.com/file/d/..."
                className="h-11 rounded-none border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Link download file asli yang akan diterima pembeli setelah
                bayar.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoLink" className="text-foreground font-medium">
                Demo Preview Link{" "}
                <span className="font-normal text-muted-foreground">
                  (Opsional)
                </span>
              </Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="demoLink"
                  name="demoLink"
                  type="url"
                  defaultValue={product?.demo_link || ""}
                  placeholder="https://preview-undangan.com/..."
                  className="h-11 pl-9 rounded-none border-border bg-background text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Link live preview agar pembeli bisa mencoba dulu.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            Kolom Kanan - Organisasi & Gambar
            ══════════════════════════════════ */}
        <div className="space-y-4 md:space-y-6">
          {/* ── Status & Organisasi ── */}
          <div className="space-y-4 border border-border bg-card p-4 md:p-6 shadow-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 bg-primary block flex-shrink-0" />
              <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                Organisasi
              </h2>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between border border-border bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm md:text-base font-medium text-foreground cursor-pointer">
                  Status Aktif
                </Label>
                <p className="text-xs text-muted-foreground">
                  Tampilkan di toko
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Kategori</Label>
              <div className="flex gap-2">
                <Select
                  name="categoryId"
                  defaultValue={product?.category_id || ""}
                >
                  <SelectTrigger className="flex-1 h-11 rounded-none border-border bg-background text-foreground">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border bg-card">
                    {categoryList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
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
                      className="h-11 w-11 flex-shrink-0 rounded-none border-border text-foreground hover:bg-muted hover:text-primary shadow-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none border-border bg-card">
                    <DialogHeader>
                      <DialogTitle className="text-foreground font-bold tracking-tight">
                        Tambah Kategori
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handleAddCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="catName"
                          className="text-foreground font-medium"
                        >
                          Nama Kategori
                        </Label>
                        <Input
                          id="catName"
                          name="name"
                          required
                          placeholder="Contoh: E-Books"
                          className="h-11 rounded-none border-border bg-background text-foreground"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-none"
                      >
                        Tambah
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground font-medium">
                Tags (Label)
              </Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={product?.tags?.join(", ") || ""}
                placeholder="wedding, luxury, gold"
                className="h-11 rounded-none border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Pisahkan dengan koma (contoh: tag1, tag2).
              </p>
            </div>
          </div>

          {/* ── Media ── */}
          <div className="space-y-4 border border-border bg-card p-4 md:p-6 shadow-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 bg-primary block flex-shrink-0" />
              <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                Media
              </h2>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Thumbnail Gambar
              </Label>
              <div className="flex flex-col gap-3">
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/40">
                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Belum ada gambar</span>
                    </div>
                  )}
                </div>

                <label
                  htmlFor="thumbnail"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted hover:text-primary hover:border-primary/40"
                >
                  <Upload className="h-4 w-4" />
                  {previewUrl ? "Ganti Gambar" : "Upload Gambar"}
                </label>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-center text-xs text-muted-foreground">
                  PNG, JPG, WebP — Max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* ── Desktop Action Buttons ── */}
          <div className="hidden md:flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full h-11 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-none"
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
                className="w-full h-11 rounded-none border-border text-foreground hover:bg-muted shadow-none"
              >
                Batal
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Mobile Sticky Bottom Bar ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-6 flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <Link href="/admin/products" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-none border-border text-foreground font-semibold hover:bg-muted shadow-none"
            >
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 h-11 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-none"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Terbitkan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
