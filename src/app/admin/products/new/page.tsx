import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const admin = createAdminClient();

  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="w-full max-w-full relative overflow-hidden min-h-screen">
      {/* Decorative Page Background (Hero Style) */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] aspect-square bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] -right-[10%] w-[40%] aspect-square bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  );
}
