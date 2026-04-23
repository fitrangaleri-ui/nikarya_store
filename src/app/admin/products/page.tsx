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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { PlusIcon, PencilIcon, PhotoIcon, CubeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { DeleteProductButton, DuplicateProductButton, ToggleStatusButton } from "./delete-button";
import { FilterSelect } from "../filter-select";
import { CategorySection } from "./category-section";
import { ImportExportSection } from "./import-export";
import { StickyHeader } from "../sticky-header";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const { search, status, category, page } = await searchParams;
  const admin = createAdminClient();

  const currentPage = parseInt(page || "1", 10);
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  let query = admin
    .from("products")
    .select("*, categories(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike("title", `%${search}%`);
  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);
  if (category) query = query.eq("category_id", category);

  const [
    { data: products, error, count },
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

  const totalPages = Math.ceil((count || 0) / limit);

  const createQueryString = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    params.set("page", String(newPage));
    return `/admin/products?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
      }
    }
    return pages;
  };

  if (error) {
    return (
      <div className="w-full rounded-xl border border-destructive/20 bg-destructive/10 p-4 sm:p-6 animate-in fade-in zoom-in-95">
        <Typography variant="body-sm" color="destructive" className="font-semibold">
          Error loading products: {error.message}
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header ── */}
      <StickyHeader
        title="Produk"
        description={<><span className="font-mono">{count || 0}</span> produk terdaftar</>}
      >
        <div className="flex items-center gap-2.5">
          <ImportExportSection />
          <Link href="/admin/products/new">
            <Button variant="outline" className="rounded-full h-10 px-5 bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary transition-all font-bold text-sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </StickyHeader>

      <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-foreground">Produk</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Search & Filter Bar ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Filter Produk
            </Typography>
          </div>
          <div className="p-5 md:p-7">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-5 w-full">
              <form className="w-full flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Cari nama produk..."
                  className="w-full h-11 rounded-sm border border-border/70 bg-background/50 pl-11 pr-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all box-border"
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
                      className="w-full rounded-sm"
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
                      className="w-full rounded-sm"
                    />
                  </div>
                </div>
                {(search || status || category) && (
                  <Link href="/admin/products" className="w-full sm:w-auto block">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 rounded-sm border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/80 transition-all active:scale-95"
                    >
                      Reset
                    </Button>
                  </Link>
                )}
              </div>
            </div>
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
                className="rounded-xl border border-border bg-card overflow-hidden transition-all"
              >
                {/* Baris atas: thumbnail + info */}
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0 h-20 w-20 rounded-sm overflow-hidden bg-muted/30 border border-border/50 flex items-center justify-center">
                    {resolveImageSrc(product.thumbnail_url) ? (
                      <Image
                        src={resolveImageSrc(product.thumbnail_url)!}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <Typography variant="body-sm" className="font-bold line-clamp-2 leading-snug">
                      {product.title}
                    </Typography>
                    <Typography variant="caption" color="muted" className="font-medium truncate mt-1">
                      {(product.categories as unknown as { name: string } | null)
                        ?.name || "—"}{" "}
                      · /{product.slug}
                    </Typography>
                    <Typography variant="body-base" color="primary" className="font-black mt-1.5 tracking-tight font-mono">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </Typography>
                  </div>
                </div>

                {/* Action bar */}
                <div className="border-t border-border bg-surface-2 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ToggleStatusButton
                      productId={product.id}
                      isActive={product.is_active}
                    />
                    <Badge
                      className={`flex-shrink-0 text-[10px] px-2.5 py-0.5 rounded-full shadow-none font-bold border ${product.is_active
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
                        className="h-10 w-10 rounded-full text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit Produk</span>
                      </Button>
                    </Link>
                    <DuplicateProductButton productId={product.id} />
                    <DeleteProductButton
                      productId={product.id}
                      productTitle={product.title}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-card py-16 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                <CubeIcon className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <Typography variant="h6" className="font-bold">
                  Belum ada produk
                </Typography>
                <Typography variant="body-sm" color="muted" className="mt-1">
                  Klik &quot;Tambah Produk&quot; untuk memulai.
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            ── DESKTOP: Products Table (≥ md)  ──
            ══════════════════════════════════════ */}
        <div className="hidden md:block w-full rounded-xl border border-border bg-card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px] w-full inline-block align-middle">
              <Table className="w-full">
                <TableHeader className="bg-primary border-b border-primary-bg/20">
                  <TableRow className="hover:bg-transparent border-transparent">
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  w-20 py-4 pl-5">
                      Gambar
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  min-w-[200px] py-4">
                      Nama Produk
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  min-w-[150px] py-4">
                      Kategori
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  min-w-[150px] py-4">
                      Harga
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  text-center min-w-[150px] py-4">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase  text-right w-32 pr-5 py-4">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-muted/50 border-border transition-colors group"
                      >
                        <TableCell className="py-4 pl-5">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm bg-muted/30 border border-border/50">
                            {resolveImageSrc(product.thumbnail_url) ? (
                              <Image
                                src={resolveImageSrc(product.thumbnail_url)!}
                                alt={product.title}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <PhotoIcon className="h-6 w-6 text-muted-foreground/40" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Typography variant="body-sm" className="font-bold line-clamp-1">
                            {product.title}
                          </Typography>
                          <Typography variant="caption" color="muted" className="mt-1 truncate max-w-[250px]">
                            /{product.slug}
                          </Typography>
                        </TableCell>
                        <TableCell className="py-4">
                          <Typography variant="body-sm" color="muted" className="font-medium">
                            {(
                              product.categories as unknown as {
                                name: string;
                              } | null
                            )?.name || (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                          </Typography>
                        </TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <Typography variant="body-sm" color="primary" className="font-black font-mono">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </Typography>
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
                        <TableCell className="py-4 text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-primary hover:text-primary/80 hover:bg-primary/10 shadow-none transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit Produk</span>
                              </Button>
                            </Link>
                            <DuplicateProductButton productId={product.id} />
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
                            <CubeIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                          <div>
                            <Typography variant="h6" className="font-bold">
                              Belum ada produk
                            </Typography>
                            <Typography variant="body-sm" color="muted" className="mt-1">
                              Klik &quot;Tambah Produk&quot; untuk memulai.
                            </Typography>
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

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center w-full pt-4">
            <Pagination>
              <PaginationContent className="bg-card border border-border p-1 rounded-xl shadow-sm">
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage > 1 ? createQueryString(currentPage - 1) : "#"}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "font-bold text-muted-foreground hover:text-primary"}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, idx) => (
                  <PaginationItem key={idx}>
                    {pageNum === -1 ? (
                      <PaginationEllipsis className="text-muted-foreground mx-1" />
                    ) : (
                      <PaginationLink
                        href={createQueryString(pageNum)}
                        isActive={currentPage === pageNum}
                        className={currentPage === pageNum ? "font-black" : "font-bold text-muted-foreground hover:text-primary"}
                      >
                        <span className="font-mono">{pageNum}</span>
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={currentPage < totalPages ? createQueryString(currentPage + 1) : "#"}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "font-bold text-muted-foreground hover:text-primary"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* ── Category Management Section ── */}
        <CategorySection categories={categoriesWithCount} />
      </div>
    </div>
  );
}
