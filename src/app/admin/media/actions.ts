"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteMedia(
  id: string,
  type: "gallery" | "product_thumbnail" | "category_thumbnail" | "unused" | string,
  imageUrl: string
) {
  const admin = createAdminClient();

  if (type === "gallery") {
    await admin.from("product_images").delete().eq("id", id);
  } else if (type === "product_thumbnail" || type === "thumbnail") {
    await admin.from("products").update({ thumbnail_url: null }).eq("id", id);
  } else if (type === "category_thumbnail") {
    await admin.from("categories").update({ thumbnail_url: null }).eq("id", id);
  } else if (type === "multiple") {
    // Unlink from all places (match by image URL because ID could refer to either)
    await admin.from("product_images").delete().eq("image_url", imageUrl);
    await admin.from("products").update({ thumbnail_url: null }).eq("thumbnail_url", imageUrl);
    await admin.from("categories").update({ thumbnail_url: null }).eq("thumbnail_url", imageUrl);
  }

  // After potentially clearing a DB reference, let's see if this exact URL is used ANYWHERE else.
  const { data: pUsage } = await admin.from("products").select("id").eq("thumbnail_url", imageUrl).limit(1);
  const pUsed = pUsage && pUsage.length > 0;

  const { data: cUsage } = await admin.from("categories").select("id").eq("thumbnail_url", imageUrl).limit(1);
  const cUsed = cUsage && cUsage.length > 0;

  const { data: gUsage } = await admin.from("product_images").select("id").eq("image_url", imageUrl).limit(1);
  const gUsed = gUsage && gUsage.length > 0;

  const isUsedElsewhere = pUsed || cUsed || gUsed;

  // If not used anywhere else (or if it was "unused"), we delete the physical storage file.
  if (!isUsedElsewhere) {
    const fileName = imageUrl.split("/").pop();
    if (fileName) {
      // Decode URI component because filenames might have URL encoding (e.g. %20 for space)
      const decodedName = decodeURIComponent(fileName.split("?")[0]);
      const { error } = await admin.storage.from("product-images").remove([decodedName]);
      if (error) {
        console.error("Failed to delete storage file:", error.message);
      }
    }
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  return { success: true };
}
