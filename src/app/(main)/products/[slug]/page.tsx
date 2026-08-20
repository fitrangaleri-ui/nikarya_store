import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import { getProductBySlug, getRecommendedProducts } from "../../lib";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  // Run main product query and auth query in parallel
  const [product, { data: { user } }] = await Promise.all([
    getProductBySlug(slug),
    supabase.auth.getUser(),
  ]);

  if (!product) notFound();

  // Recommended products fetching (4 random products regardless of category)
  const recommendedProducts = await getRecommendedProducts(product.id);

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
        demo_links: (product.product_demo_links || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((d: any) => ({ label: d.label, url: d.url, image_url: d.image_url })),
        tags: product.tags,
        thumbnail_url: product.thumbnail_url,
        video_url: product.video_url,
        product_images: product.product_images,
        category_id: product.category_id,
        categories: product.categories as unknown as { name: string; slug: string } | null,
      }}
      isLoggedIn={!!user}
      recommendedProducts={recommendedProducts}
    />
  );
}
