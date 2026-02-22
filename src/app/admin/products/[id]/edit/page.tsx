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

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin.from("products").select("*").eq("id", id).single(),
    admin.from("categories").select("id, name, slug").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="w-full max-w-full relative overflow-hidden">
      <ProductForm product={product} categories={categories || []} />
    </div>
  );
}
