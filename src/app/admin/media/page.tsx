import { createAdminClient } from "@/lib/supabase/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import {
  PhotoIcon,
  ServerStackIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
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
      <Alert
        variant="destructive"
        className="w-full rounded-2xl border-destructive/20 bg-destructive/10"
      >
        <AlertDescription className="text-sm font-semibold text-destructive">
          Error loading storage: {filesError.message}
        </AlertDescription>
      </Alert>
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
    <div className="space-y-6 md:space-y-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header — Primary banner */}
      <div className="relative rounded-2xl overflow-hidden bg-primary px-6 py-8 md:px-10">
        {/* Decorative blurs */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <Badge className="mb-3 gap-1.5 bg-primary-foreground/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground border-none">
              <PhotoIcon className="w-3 h-3" />
              Manajemen Media
            </Badge>
            <Typography
              variant="h3"
              as="h1"
              className="text-primary-foreground leading-tight"
            >
              Galeri Media Terpadu
            </Typography>
            <Typography
              variant="body-sm"
              as="p"
              className="mt-1.5 text-primary-foreground/70 leading-relaxed max-w-lg"
            >
              Sistem otomatis mendeteksi file yang terhubung dengan produk /
              kategori. Hapus file{" "}
              <strong className="text-primary-foreground">Tidak Terpakai</strong>{" "}
              untuk menghemat kuota limit.
            </Typography>
          </div>

          {/* Storage Capacity Card */}
          <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl p-4 w-full lg:w-80 backdrop-blur-md shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-primary-foreground">
                <ServerStackIcon className="h-4 w-4" />
                <Typography
                  variant="body-sm"
                  as="span"
                  className="font-bold text-primary-foreground"
                >
                  Kapasitas Storage
                </Typography>
              </div>
              <Typography
                variant="caption"
                as="span"
                className="font-mono font-bold text-primary-foreground bg-primary-foreground/20 px-2 py-0.5 rounded-full"
              >
                {totalStorageMB} MB / {maxStorageMB} MB
              </Typography>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-primary-foreground/10 rounded-full overflow-hidden mb-2.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarClass}`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>

            <div className="flex items-start gap-1.5 text-primary-foreground/70">
              <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <Typography
                variant="caption"
                as="span"
                className="text-primary-foreground/70 leading-snug"
              >
                Acuan Free Tier Supabase (1GB). Penghapusan gambar yang sudah
                dipakai di artikel/produk akan memutuskan link tersebut.
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of media */}
      <MediaGrid initialMedia={allMedia} />
    </div>
  );
}
