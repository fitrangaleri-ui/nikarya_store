import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "../../product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: categories }, { data: demoLinks }, { data: galleryImages }] = await Promise.all([
    admin.from("products").select("*").eq("id", id).single(),
    admin.from("categories").select("id, name, slug").order("name"),
    admin.from("product_demo_links").select("id, label, url, image_url, sort_order").eq("product_id", id).order("sort_order"),
    admin.from("product_images").select("id, image_url, sort_order").eq("product_id", id).order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div className="w-full max-w-full relative overflow-hidden min-h-screen">
      {/* Decorative Page Background (Hero Style) */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] aspect-square bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] -right-[10%] w-[40%] aspect-square bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <ProductForm
          product={{
            ...product,
            demo_links: demoLinks || [],
            gallery_images: galleryImages || [],
          }}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
