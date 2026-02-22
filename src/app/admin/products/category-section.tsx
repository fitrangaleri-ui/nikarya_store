"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/resolve-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Upload,
  X,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../categories/actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  parent_id: string | null;
};

type CategoryWithCount = Category & {
  productCount: number;
  children?: CategoryWithCount[];
};

// Common Input Class
const inputClass =
  "w-full h-11 rounded-2xl border border-border/50 bg-background/50 px-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all shadow-sm";

// ─── Add / Edit Dialog ──────────────────────────────────────────────────────

function CategoryDialog({
  category,
  allCategories,
  trigger,
}: {
  category?: Category;
  allCategories: Category[];
  trigger: React.ReactNode;
}) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(category?.thumbnail_url || "");
  const [parentId, setParentId] = useState(category?.parent_id || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out self and own children from parent list
  const parentOptions = allCategories.filter(
    (c) => c.parent_id === null && c.id !== category?.id,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setPreviewUrl(category?.thumbnail_url || "");
    setParentId(category?.parent_id || "");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (parentId) {
      formData.set("parent_id", parentId);
    }

    if (
      isEdit &&
      category?.thumbnail_url &&
      previewUrl === category.thumbnail_url
    ) {
      formData.set("existingThumbnail", category.thumbnail_url);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);

      if (result && "error" in result) {
        setError(result.error as string);
      } else {
        setOpen(false);
        resetForm();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl rounded-3xl shadow-lg sm:max-w-md p-6 gap-0">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-xl font-black tracking-tight text-foreground text-left">
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-semibold text-destructive animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <Label
              htmlFor="catName"
              className="text-sm font-bold text-foreground"
            >
              Nama Kategori <span className="text-destructive">*</span>
            </Label>
            <Input
              id="catName"
              name="name"
              defaultValue={category?.name || ""}
              required
              placeholder="Contoh: Undangan Pernikahan"
              className={inputClass}
            />
          </div>

          {/* Parent Selector */}
          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-foreground">
              Kategori Induk{" "}
              <span className="text-muted-foreground/60 font-medium text-xs ml-1">
                (Opsional)
              </span>
            </Label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Tanpa Induk (Parent) —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-foreground">
              Thumbnail Gambar
            </Label>
            <div className="flex flex-col gap-3">
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-background/30 transition-colors">
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
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive/90 backdrop-blur-sm text-destructive-foreground flex items-center justify-center hover:bg-destructive hover:scale-105 transition-all shadow-md"
                      aria-label="Hapus gambar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                    <ImageIcon className="h-8 w-8 mb-1" />
                    <span className="text-xs font-semibold">
                      Belum ada gambar
                    </span>
                  </div>
                )}
              </div>
              <label
                htmlFor={`thumb-${category?.id || "new"}`}
                className="flex w-full h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/50 px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-[0.98] shadow-sm"
              >
                <Upload className="h-4 w-4" />
                {previewUrl ? "Ganti Gambar" : "Upload Gambar"}
              </label>
              <input
                ref={fileInputRef}
                id={`thumb-${category?.id || "new"}`}
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-2xl shadow-sm h-11 transition-all active:scale-[0.98] disabled:opacity-70"
              disabled={isPending}
            >
              {isPending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Kategori"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Button ──────────────────────────────────────────────────────────

function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (
      !confirm(
        `Hapus kategori "${categoryName}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result && "error" in result) {
        alert(result.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl text-destructive hover:text-destructive/80 hover:bg-destructive/10 shadow-none transition-colors"
      onClick={handleDelete}
      disabled={isPending}
      title="Hapus Kategori"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Hapus</span>
    </Button>
  );
}

// ─── Category Row ───────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  allCategories,
  depth = 0,
}: {
  cat: CategoryWithCount;
  allCategories: Category[];
  depth?: number;
}) {
  return (
    <>
      <TableRow className="hover:bg-muted/30 border-border/40 transition-colors group">
        <TableCell className="w-16 sm:w-24 pl-4 py-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center overflow-hidden rounded-xl bg-muted/30 border border-border/50">
            {resolveImageSrc(cat.thumbnail_url) ? (
              <Image
                src={resolveImageSrc(cat.thumbnail_url)!}
                alt={cat.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/40" />
            )}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-1.5"
            style={{
              paddingLeft: `${depth * (typeof window !== "undefined" && window.innerWidth < 640 ? 12 : 24)}px`,
            }}
          >
            <div className="flex items-center gap-1.5">
              {depth > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              )}
              <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {cat.name}
              </p>
            </div>
            {cat.parent_id && (
              <Badge
                variant="outline"
                className="w-fit text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border-border/50 bg-muted/30 text-muted-foreground font-bold ml-5 sm:ml-1"
              >
                Sub Kategori
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="hidden xs:table-cell py-3">
          <p className="text-xs font-medium text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
            /{cat.slug}
          </p>
        </TableCell>
        <TableCell className="text-center w-16 sm:w-24 py-3">
          <Badge className="bg-muted/50 text-foreground border border-border/50 rounded-lg shadow-none font-bold px-2 py-1 text-xs">
            {cat.productCount}
          </Badge>
        </TableCell>
        <TableCell className="text-right w-24 sm:w-32 pr-6 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <CategoryDialog
              category={cat}
              allCategories={allCategories}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              }
            />
            <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
          </div>
        </TableCell>
      </TableRow>
      {cat.children?.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          allCategories={allCategories}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

// ─── Main Section ───────────────────────────────────────────────────────────

export function CategorySection({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  // Build tree: parents first, then nest children
  const parents = categories.filter((c) => !c.parent_id);
  const childMap = new Map<string, CategoryWithCount[]>();
  categories
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const list = childMap.get(c.parent_id!) || [];
      list.push(c);
      childMap.set(c.parent_id!, list);
    });

  const tree = parents.map((p) => ({
    ...p,
    children: childMap.get(p.id) || [],
  }));

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-1.5 h-6 md:h-7 bg-primary rounded-full block flex-shrink-0" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Manajemen Kategori
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground ml-4 md:ml-5">
            <strong className="text-foreground">{categories.length}</strong>{" "}
            kategori terdaftar
          </p>
        </div>
        <CategoryDialog
          allCategories={categories}
          trigger={
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-2xl shadow-sm h-11 px-5 transition-all active:scale-[0.98]">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          }
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm relative w-full overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar rounded-3xl">
          <Table className="w-full min-w-[600px]">
            <TableHeader className="bg-background/95 backdrop-blur-sm border-b border-border/40">
              <TableRow className="hover:bg-transparent border-transparent">
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-20 sm:w-24 pl-4 py-4">
                  Gambar
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[150px] py-4">
                  Nama Kategori
                </TableHead>
                <TableHead className="hidden xs:table-cell text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[120px] py-4">
                  Slug
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-20 sm:w-24 py-4">
                  Produk
                </TableHead>
                <TableHead className="text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-28 sm:w-32 pr-6 py-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tree.length > 0 ? (
                tree.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    allCategories={categories}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 hover:bg-transparent"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                        <FolderOpen className="h-7 w-7 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Belum ada kategori
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          Klik &quot;Tambah Kategori&quot; untuk memulai.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
