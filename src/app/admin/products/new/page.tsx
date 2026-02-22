import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const admin = createAdminClient();

  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="w-full max-w-full relative overflow-hidden">
      <ProductForm categories={categories || []} />
    </div>
  );
}
