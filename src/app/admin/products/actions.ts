"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role?.toUpperCase() !== "ADMIN") return null;
  return user;
}

export async function createProduct(formData: FormData) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);

  // Field Baru
  const discountPriceRaw = formData.get("discountPrice") as string;
  const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : null;

  const sku = (formData.get("sku") as string) || null;
  const demoLink = (formData.get("demoLink") as string) || null;

  const tagsRaw = formData.get("tags") as string;
  // Convert string "tag1, tag2" menjadi array ["tag1", "tag2"]
  const tags = tagsRaw
    ? tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    : [];

  const categoryId = (formData.get("categoryId") as string) || null;
  const driveFileUrl = formData.get("driveFileUrl") as string;
  const isActive = formData.get("isActive") === "on";
  const thumbnailFile = formData.get("thumbnail") as File | null;

  let thumbnailUrl = "";

  if (thumbnailFile && thumbnailFile.size > 0) {
    const fileExt = thumbnailFile.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, thumbnailFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload gagal: ${uploadError.message}` };
    }

    const { data: publicUrl } = admin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    thumbnailUrl = publicUrl.publicUrl;
  }

  const { error } = await admin.from("products").insert({
    title,
    slug,
    description,
    price,
    discount_price: discountPrice, // Insert field baru
    sku,
    demo_link: demoLink,
    tags: tags.length > 0 ? tags : null,
    category_id: categoryId || null,
    drive_file_url: driveFileUrl,
    is_active: isActive,
    thumbnail_url: thumbnailUrl || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);

  // Field Baru Update
  const discountPriceRaw = formData.get("discountPrice") as string;
  const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : null;

  const sku = (formData.get("sku") as string) || null;
  const demoLink = (formData.get("demoLink") as string) || null;

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    : [];

  const categoryId = (formData.get("categoryId") as string) || null;
  const driveFileUrl = formData.get("driveFileUrl") as string;
  const isActive = formData.get("isActive") === "on";
  const thumbnailFile = formData.get("thumbnail") as File | null;
  const existingThumbnail = formData.get("existingThumbnail") as string;

  let thumbnailUrl = existingThumbnail || "";

  if (thumbnailFile && thumbnailFile.size > 0) {
    const fileExt = thumbnailFile.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;

    if (existingThumbnail) {
      const oldFileName = existingThumbnail.split("/").pop();
      if (oldFileName) {
        await admin.storage.from("product-images").remove([oldFileName]);
      }
    }

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, thumbnailFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload gagal: ${uploadError.message}` };
    }

    const { data: publicUrl } = admin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    thumbnailUrl = publicUrl.publicUrl;
  }

  const { error } = await admin
    .from("products")
    .update({
      title,
      slug,
      description,
      price,
      discount_price: discountPrice, // Update field baru
      sku,
      demo_link: demoLink,
      tags: tags.length > 0 ? tags : null,
      category_id: categoryId || null,
      drive_file_url: driveFileUrl,
      is_active: isActive,
      thumbnail_url: thumbnailUrl || null,
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("thumbnail_url")
    .eq("id", productId)
    .single();

  if (product?.thumbnail_url) {
    const fileName = product.thumbnail_url.split("/").pop();
    if (fileName) {
      await admin.storage.from("product-images").remove([fileName]);
    }
  }

  const { error } = await admin.from("products").delete().eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
}

export async function toggleProductStatus(
  productId: string,
  isActive: boolean,
) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { error } = await admin
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductImage(productId: string) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("thumbnail_url")
    .eq("id", productId)
    .single();

  if (product?.thumbnail_url) {
    const fileName = product.thumbnail_url.split("/").pop();
    if (fileName) {
      await admin.storage.from("product-images").remove([fileName]);
    }
  }

  const { error } = await admin
    .from("products")
    .update({ thumbnail_url: null })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

