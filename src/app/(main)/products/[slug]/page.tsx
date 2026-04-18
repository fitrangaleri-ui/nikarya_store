import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const adminClient = createAdminClient();
  const { data: product } = await adminClient
    .from("products")
    .select(
      "id, title, slug, description, price, discount_price, sku, demo_link, tags, thumbnail_url, category_id, categories(name), product_demo_links(id, label, url, sort_order), product_images(image_url, sort_order)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch related products (same category, exclude current, max 4)
  let relatedProducts: any[] = [];
  if (product.category_id) {
    const { data: related } = await adminClient
      .from("products")
      .select("id, title, slug, price, discount_price, sku, demo_link, tags, thumbnail_url, product_demo_links(id, label, url, sort_order), product_images(image_url, sort_order)")
      .eq("category_id", product.category_id)
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(4);

    relatedProducts = related || [];
  }

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price,
        sku: product.sku,
        demo_link: product.demo_link,
        demo_links: (product.product_demo_links || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((d: any) => ({ label: d.label, url: d.url })),
        tags: product.tags,
        thumbnail_url: product.thumbnail_url,
        product_images: product.product_images,
        category_id: product.category_id,
        categories: product.categories as unknown as { name: string } | null,
      }}
      isLoggedIn={!!user}
      relatedProducts={relatedProducts}
    />
  );
}
