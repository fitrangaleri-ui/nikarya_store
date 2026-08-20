import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Cache homepage categories list (max 8)
export const getHomepageCategories = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("categories")
      .select("id, name, slug, thumbnail_url, products(count)")
      .order("name")
      .limit(8);
    return data || [];
  },
  ["homepage-categories"],
  { revalidate: 60 }
);

// Cache homepage featured categories with their products (max 4)
export const getHomepageFeaturedCategories = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("categories")
      .select(
        `id, name, slug,
         products (
           id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link,
           categories(name),
           product_demo_links(id, label, url, image_url, sort_order),
           product_images(image_url, sort_order)
         )`
      )
      .not("products", "is", null)
      .limit(4);
    return data || [];
  },
  ["homepage-featured"],
  { revalidate: 60 }
);

// Cache homepage new arrivals (max 24)
export const getHomepageNewArrivals = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select(
        "id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link, categories(name), product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)"
      )
      .eq("is_active", true)
      .not("tags", "is", null)
      .order("created_at", { ascending: false })
      .limit(24);
    return data || [];
  },
  ["homepage-new-arrivals"],
  { revalidate: 60 }
);

// Cache products page metadata (categories, max price, category counts)
export const getProductsPageMeta = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const [
      { data: categories },
      { data: maxPriceArr },
      { data: allProductsForCount },
    ] = await Promise.all([
      admin
        .from("categories")
        .select("id, name, slug, parent_id, thumbnail_url")
        .order("name"),
      admin
        .from("products")
        .select("price")
        .eq("is_active", true)
        .order("price", { ascending: false })
        .limit(1),
      admin.from("products").select("category_id").eq("is_active", true),
    ]);

    const globalMin = 0;
    const globalMax = Math.ceil((maxPriceArr?.[0]?.price || 1000000) / 1000) * 1000;

    const categoryCounts: Record<string, number> = {};
    allProductsForCount?.forEach((p) => {
      if (p.category_id) {
        categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
      }
    });

    categories
      ?.filter((c) => c.parent_id)
      .forEach((child) => {
        if (child.parent_id && categoryCounts[child.id]) {
          categoryCounts[child.parent_id] =
            (categoryCounts[child.parent_id] || 0) + categoryCounts[child.id];
        }
      });

    return {
      categories: categories || [],
      globalMin,
      globalMax,
      categoryCounts,
    };
  },
  ["products-meta"],
  { revalidate: 60 }
);

// Cache single product details by slug
export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select(
        "id, title, slug, description, price, discount_price, sku, demo_link, tags, thumbnail_url, video_url, category_id, categories(name, slug), product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data || null;
  },
  ["product-detail"],
  { revalidate: 30 }
);

// Cache related products (max 12)
export const getRelatedProducts = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select(
        "id, title, slug, price, discount_price, sku, demo_link, tags, thumbnail_url, video_url, product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)"
      )
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .neq("id", excludeId)
      .limit(12);
    return data || [];
  },
  ["related-products"],
  { revalidate: 60 }
);

// Cache recommended products (4 random active products across all categories, excluding current product)
export const getRecommendedProducts = unstable_cache(
  async (excludeId?: string) => {
    const admin = createAdminClient();
    let query = admin
      .from("products")
      .select(
        "id, title, slug, price, discount_price, sku, demo_link, tags, thumbnail_url, video_url, categories(name), product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)"
      )
      .eq("is_active", true);

    if (excludeId && excludeId.trim() !== "") {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.limit(30);

    if (!data || data.length === 0) return [];

    // Shuffle candidate pool and pick 4
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  },
  ["recommended-products"],
  { revalidate: 30 }
);

// Cache landing page products by SKU pattern
export const getLandingPageProduct = unstable_cache(
  async (skuPattern: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select(
        "id, sku, slug, title, price, discount_price, thumbnail_url, product_demo_links(id, label, url, image_url, sort_order)"
      )
      .eq("is_active", true)
      .ilike("sku", skuPattern)
      .limit(1)
      .maybeSingle();
    return data || null;
  },
  ["landing-product"],
  { revalidate: 120 }
);
