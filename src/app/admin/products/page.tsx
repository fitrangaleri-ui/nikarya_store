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
import { Plus, Pencil, ImageIcon, Package } from "lucide-react";
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
      <div className="rounded-none border border-destructive/20 bg-destructive/10 p-4 sm:p-6 text-sm font-semibold text-destructive">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Manajemen Produk
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">
            {products?.length || 0} produk terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <ImportExportSection />
          <Link href="/admin/products/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 px-4 transition-all active:scale-[0.98]">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col gap-2.5">
        <form className="w-full">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Cari nama produk..."
            className="w-full h-11 rounded-none border border-border bg-background px-4 py-2 text-sm text-foreground font-medium placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          {status && <input type="hidden" name="status" value={status} />}
          {category && <input type="hidden" name="category" value={category} />}
        </form>

        <div className="flex flex-row gap-2.5 w-full">
          <div className="flex-1 min-w-0">
            <FilterSelect
              name="status"
              defaultValue={status || ""}
              options={[
                { value: "", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ]}
            />
          </div>
          <div className="flex-1 min-w-0">
            <FilterSelect
              name="category"
              defaultValue={category || ""}
              options={[
                { value: "", label: "Semua Kategori" },
                ...(categories?.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })) || []),
              ]}
            />
          </div>
          {(search || status || category) && (
            <Link href="/admin/products" className="flex-shrink-0">
              <Button
                variant="outline"
                className="h-11 px-4 rounded-none border-border text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 shadow-none transition-colors"
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
      <div className="flex flex-col gap-2.5 md:hidden">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border border-border bg-background overflow-hidden"
            >
              {/* Baris atas: thumbnail + info */}
              <div className="flex gap-3 p-3">
                <div className="flex-shrink-0 h-[72px] w-[72px] overflow-hidden bg-muted/20 border border-border flex items-center justify-center">
                  {resolveImageSrc(product.thumbnail_url) ? (
                    <Image
                      src={resolveImageSrc(product.thumbnail_url)!}
                      alt={product.title}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug flex-1">
                      {product.title}
                    </p>
                    <Badge
                      className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-none shadow-none font-bold border ${
                        product.is_active
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {product.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <p className="text-[11px] font-medium text-muted-foreground truncate mt-1">
                    {(product.categories as unknown as { name: string } | null)
                      ?.name || "—"}{" "}
                    · /{product.slug}
                  </p>

                  <p className="text-base font-extrabold text-foreground mt-1.5 tracking-tight">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="border-t border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToggleStatusButton
                    productId={product.id}
                    isActive={product.is_active}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {product.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
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
          <div className="border border-border bg-background py-16 flex flex-col items-center gap-4">
            <div className="h-16 w-16 border border-border bg-muted/20 flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/30" />
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
      <div className="hidden md:block border border-border bg-background shadow-none relative w-full overflow-hidden">
        <div className="overflow-auto max-h-[600px] w-full">
          <Table className="min-w-[800px] w-full relative">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-border">
                <TableHead className="text-xs font-bold text-muted-foreground w-20">
                  Gambar
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[200px]">
                  Nama Produk
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[150px]">
                  Kategori
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[150px]">
                  Harga
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground text-center min-w-[150px]">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground w-28 pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-muted/30 border-border transition-colors"
                  >
                    <TableCell>
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden bg-muted/20 border border-border">
                        {resolveImageSrc(product.thumbnail_url) ? (
                          <Image
                            src={resolveImageSrc(product.thumbnail_url)!}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-bold text-foreground line-clamp-1">
                        {product.title}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate max-w-[250px]">
                        /{product.slug}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {(
                        product.categories as unknown as { name: string } | null
                      )?.name || (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-extrabold text-foreground whitespace-nowrap">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <ToggleStatusButton
                          productId={product.id}
                          isActive={product.is_active}
                        />
                        <Badge
                          className={
                            product.is_active
                              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-none shadow-none font-bold"
                              : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 rounded-none shadow-none font-bold"
                          }
                        >
                          {product.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
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
                    className="text-center py-16 hover:bg-transparent"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
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

      {/* ── Category Management Section ── */}
      <div className="border-t border-border pt-6 md:pt-8 mt-6 md:mt-8 w-full">
        <CategorySection categories={categoriesWithCount} />
      </div>
    </div>
  );
}
