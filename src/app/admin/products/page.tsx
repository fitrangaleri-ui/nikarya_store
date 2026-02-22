import Link from "next/link";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/resolve-image";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, ImageIcon, Package, Search } from "lucide-react";
import { DeleteProductButton, ToggleStatusButton } from "./delete-button";
import { FilterSelect } from "../filter-select";
import { CategorySection } from "./category-section";
import { ImportExportSection } from "./import-export";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
  }>;
}) {
  const { search, status, category } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("title", `%${search}%`);
  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);
  if (category) query = query.eq("category_id", category);

  const [
    { data: products, error },
    { data: categories },
    { data: allProducts },
  ] = await Promise.all([
    query,
    admin
      .from("categories")
      .select("id, name, slug, thumbnail_url, parent_id")
      .order("name"),
    admin.from("products").select("category_id"),
  ]);

  const countMap: Record<string, number> = {};
  allProducts?.forEach((p) => {
    if (p.category_id) {
      countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
    }
  });

  const categoriesWithCount = (categories || []).map((cat) => ({
    ...cat,
    productCount: countMap[cat.id] || 0,
  }));

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/10 p-4 sm:p-6 text-sm font-semibold text-destructive animate-in fade-in zoom-in-95">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    // PENGUNCIAN UTAMA: overflow-hidden & max-w-full
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-hidden pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-1.5 h-8 bg-primary rounded-full block flex-shrink-0" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground truncate">
              Manajemen Produk
            </h1>
          </div>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground ml-5">
            <strong className="text-foreground">{products?.length || 0}</strong>{" "}
            produk terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <ImportExportSection />
          <Link href="/admin/products/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-2xl shadow-sm h-11 px-5 transition-all active:scale-[0.98]">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="w-full flex flex-col lg:flex-row gap-3 md:gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-3 sm:p-4 rounded-3xl shadow-sm">
        <form className="w-full flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Cari nama produk..."
            className="w-full h-11 rounded-2xl border border-border/50 bg-background/50 pl-11 pr-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all shadow-sm box-border"
          />
          {status && <input type="hidden" name="status" value={status} />}
          {category && <input type="hidden" name="category" value={category} />}
        </form>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-36 min-w-0">
              <FilterSelect
                name="status"
                defaultValue={status || ""}
                options={[
                  { value: "", label: "Semua Status" },
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
                className="w-full rounded-2xl"
              />
            </div>
            <div className="flex-1 sm:w-44 min-w-0">
              <FilterSelect
                name="category"
                defaultValue={category || ""}
                options={[
                  { value: "", label: "Kategori" },
                  ...(categories?.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })) || []),
                ]}
                className="w-full rounded-2xl"
              />
            </div>
          </div>
          {(search || status || category) && (
            <Link href="/admin/products" className="w-full sm:w-auto block">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-2xl border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/80 shadow-sm transition-all active:scale-95"
              >
                Reset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          ── MOBILE: Product Card List (< md) ──
          ══════════════════════════════════════ */}
      <div className="flex flex-col gap-4 md:hidden w-full">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden transition-all"
            >
              {/* Baris atas: thumbnail + info */}
              <div className="flex gap-4 p-4">
                <div className="flex-shrink-0 h-20 w-20 rounded-2xl overflow-hidden bg-muted/30 border border-border/50 flex items-center justify-center">
                  {resolveImageSrc(product.thumbnail_url) ? (
                    <Image
                      src={resolveImageSrc(product.thumbnail_url)!}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                    {product.title}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground truncate mt-1">
                    {(product.categories as unknown as { name: string } | null)
                      ?.name || "—"}{" "}
                    · /{product.slug}
                  </p>
                  <p className="text-base font-black text-primary mt-1.5 tracking-tight">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="border-t border-border/40 bg-muted/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ToggleStatusButton
                    productId={product.id}
                    isActive={product.is_active}
                  />
                  <Badge
                    className={`flex-shrink-0 text-[10px] px-2.5 py-0.5 rounded-full shadow-none font-bold border ${
                      product.is_active
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {product.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Produk</span>
                    </Button>
                  </Link>
                  <DeleteProductButton
                    productId={product.id}
                    productTitle={product.title}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md py-16 flex flex-col items-center gap-4 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">
                Belum ada produk
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Klik &quot;Tambah Produk&quot; untuk memulai.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ── DESKTOP: Products Table (≥ md)  ──
          ══════════════════════════════════════ */}
      <div className="hidden md:block w-full rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="w-full overflow-x-auto custom-scrollbar rounded-3xl">
          <div className="min-w-[900px] w-full inline-block align-middle">
            <Table className="w-full">
              <TableHeader className="bg-background/95 backdrop-blur-sm border-b border-border/40">
                <TableRow className="hover:bg-transparent border-transparent">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-20 py-4 pl-4">
                    Gambar
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[200px] py-4">
                    Nama Produk
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[150px] py-4">
                    Kategori
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[150px] py-4">
                    Harga
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center min-w-[150px] py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right w-32 pr-6 py-4">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="hover:bg-muted/30 border-border/40 transition-colors group"
                    >
                      <TableCell className="py-4 pl-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-muted/30 border border-border/50">
                          {resolveImageSrc(product.thumbnail_url) ? (
                            <Image
                              src={resolveImageSrc(product.thumbnail_url)!}
                              alt={product.title}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-foreground line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1 truncate max-w-[250px]">
                          /{product.slug}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                        {(
                          product.categories as unknown as {
                            name: string;
                          } | null
                        )?.name || (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-black text-primary whitespace-nowrap">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <ToggleStatusButton
                            productId={product.id}
                            isActive={product.is_active}
                          />
                          <Badge
                            className={
                              product.is_active
                                ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3 py-1 text-[11px]"
                                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 rounded-full shadow-none font-bold px-3 py-1 text-[11px]"
                            }
                          >
                            {product.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit Produk</span>
                            </Button>
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productTitle={product.title}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-20 hover:bg-transparent"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Belum ada produk
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            Klik &quot;Tambah Produk&quot; untuk memulai.
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

      {/* ── Category Management Section ── */}
      <div className="border-t border-border/40 pt-6 md:pt-8 mt-2 w-full">
        <CategorySection categories={categoriesWithCount} />
      </div>
    </div>
  );
}
