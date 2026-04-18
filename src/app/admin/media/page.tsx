import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import {
  ServerStackIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { StickyHeader } from "../sticky-header";
import { MediaGrid, type MediaItem } from "./media-grid";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const admin = createAdminClient();

  // 1. Fetch current storage files
  const { data: files, error: filesError } = await admin.storage
    .from("product-images")
    .list(undefined, {
      limit: 10000,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (filesError) {
    return (
      <div className="w-full rounded-xl border border-destructive/20 bg-destructive/10 p-4 sm:p-6 animate-in fade-in zoom-in-95">
        <Typography variant="body-sm" color="destructive" className="font-semibold">
          Error loading storage: {filesError.message}
        </Typography>
      </div>
    );
  }

  // Calculate storage usage
  const MAX_STORAGE_BYTES = 1073741824; // 1GB limit (Free Tier)
  const totalStorageBytes = (files || []).reduce(
    (acc, file) => acc + (file.metadata?.size || 0),
    0
  );
  const storagePercentage = Math.min(
    (totalStorageBytes / MAX_STORAGE_BYTES) * 100,
    100
  );
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);
  const maxStorageMB = (MAX_STORAGE_BYTES / (1024 * 1024)).toFixed(0);

  // Determine base public URL
  const {
    data: { publicUrl: sampleUrl },
  } = admin.storage.from("product-images").getPublicUrl("sample.jpg");
  const baseUrl = sampleUrl.substring(
    0,
    sampleUrl.lastIndexOf("/sample.jpg")
  );

  // 2. Fetch all DB Usages
  const [{ data: galleryImages }, { data: products }, { data: categories }] =
    await Promise.all([
      admin
        .from("product_images")
        .select("id, product_id, image_url, created_at, products(title)"),
      admin
        .from("products")
        .select("id, title, thumbnail_url, created_at")
        .not("thumbnail_url", "is", null),
      admin
        .from("categories")
        .select("id, name, thumbnail_url, created_at")
        .not("thumbnail_url", "is", null),
    ]);

  const dbUsages = new Map<
    string,
    {
      type: "gallery" | "product_thumbnail" | "category_thumbnail";
      id: string;
      title: string;
      created_at: string;
    }[]
  >();

  const addUsage = (url: string | null, usage: any) => {
    if (!url) return;
    const existing = dbUsages.get(url) || [];
    existing.push(usage);
    dbUsages.set(url, existing);
  };

  galleryImages?.forEach((img) =>
    addUsage(img.image_url, {
      type: "gallery",
      id: img.id,
      title: (img.products as any)?.title || "Produk Dihapus",
      created_at: img.created_at,
    })
  );
  products?.forEach((p) =>
    addUsage(p.thumbnail_url, {
      type: "product_thumbnail",
      id: p.id,
      title: p.title,
      created_at: p.created_at,
    })
  );
  categories?.forEach((c) =>
    addUsage(c.thumbnail_url, {
      type: "category_thumbnail",
      id: c.id,
      title: `${c.name}`,
      created_at: c.created_at || new Date().toISOString(),
    })
  );

  const allMedia: MediaItem[] = [];
  const processedUrls = new Set<string>();

  // 3. Reconcile Storage Files with DB Usages
  files?.forEach((file) => {
    if (file.name === ".emptyFolderPlaceholder") return;

    // Supabase storage might have encoded characters in URLs
    const encodedFileName = file.name
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    const fileUrl = `${baseUrl}/${encodedFileName}`;
    processedUrls.add(fileUrl);
    processedUrls.add(`${baseUrl}/${file.name}`);

    // Check usages
    let usages =
      dbUsages.get(fileUrl) || dbUsages.get(`${baseUrl}/${file.name}`) || [];

    // Fallback if URL base didn't match perfectly
    if (usages.length === 0) {
      for (const [dbUrl, dbUsageList] of dbUsages.entries()) {
        if (
          dbUrl.includes(file.name) ||
          dbUrl.includes(encodedFileName)
        ) {
          usages = dbUsageList;
          processedUrls.add(dbUrl); // Mark this exact db URL as processed
          break;
        }
      }
    }

    const size = file.metadata?.size || 0;

    if (usages.length === 0) {
      allMedia.push({
        id: `unused-${file.name}`,
        type: "unused",
        product_id: null,
        product_title: `${file.name}`,
        image_url: fileUrl,
        created_at: file.created_at || new Date().toISOString(),
        size,
        file_name: file.name,
      });
    } else {
      const allTypes = Array.from(new Set(usages.map((u) => u.type)));
      const combinedType = allTypes.length > 1 ? "multiple" : allTypes[0];

      allMedia.push({
        id: usages[0].id,
        type: combinedType,
        product_id: usages[0].id,
        product_title: usages[0].title,
        image_url: fileUrl,
        created_at:
          usages[0].created_at || file.created_at || new Date().toISOString(),
        size,
        file_name: file.name,
      });
    }
  });

  // 4. Find broken links (in DB but not physical files in Storage)
  for (const [url, usages] of dbUsages.entries()) {
    if (!processedUrls.has(url)) {
      const allTypes = Array.from(new Set(usages.map((u) => u.type)));
      const combinedType = allTypes.length > 1 ? "multiple" : allTypes[0];

      allMedia.push({
        id: usages[0].id,
        type: combinedType,
        product_id: usages[0].id,
        product_title: `${usages[0].title}`,
        image_url: url,
        created_at: usages[0].created_at,
        size: 0,
      });
    }
  }

  // Sort by date descending
  allMedia.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Progress bar color based on usage
  const progressBarClass =
    storagePercentage > 90
      ? "bg-destructive"
      : storagePercentage > 75
        ? "bg-warning"
        : "bg-success";

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header ── */}
      <StickyHeader
        title="Galeri Media"
        description="Kelola file gambar produk dan kategori."
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        {/* ── Storage Capacity Card ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Kapasitas Storage
            </Typography>
            <Typography variant="caption" className="text-white/70 font-medium mt-0.5">
              Sistem otomatis mendeteksi file yang terhubung dengan produk / kategori.
            </Typography>
          </div>

          <div className="p-5 md:p-7">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ServerStackIcon className="h-5 w-5 text-primary" />
                <Typography variant="body-sm" className="font-bold">
                  Penggunaan Storage
                </Typography>
              </div>
              <Badge className="font-mono font-bold bg-primary/10 text-primary border border-primary/20 rounded-full shadow-none px-3 py-1">
                {totalStorageMB} MB / {maxStorageMB} MB
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarClass}`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>

            <div className="flex items-start gap-2 bg-muted/30 rounded-sm p-3 border border-border/50">
              <ExclamationCircleIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <Typography variant="caption" color="muted" className="leading-snug font-medium">
                Acuan Free Tier Supabase (1GB). Hapus file{" "}
                <strong className="text-foreground">Tidak Terpakai</strong>{" "}
                untuk menghemat kuota. Penghapusan gambar yang sudah dipakai akan memutuskan link tersebut.
              </Typography>
            </div>
          </div>
        </div>

        {/* ── Grid of media ── */}
        <MediaGrid initialMedia={allMedia} />
      </div>
    </div>
  );
}
