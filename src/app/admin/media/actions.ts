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
  } else if (type === "product_video") {
    await admin.from("products").update({ video_url: null }).eq("id", id);
  } else if (type === "category_thumbnail") {
    await admin.from("categories").update({ thumbnail_url: null }).eq("id", id);
  } else if (type === "demo_link") {
    await admin.from("product_demo_links").update({ image_url: null }).eq("id", id);
  } else if (type === "multiple") {
    // Unlink from all places (match by image URL because ID could refer to either)
    await admin.from("product_images").delete().eq("image_url", imageUrl);
    await admin.from("products").update({ thumbnail_url: null }).eq("thumbnail_url", imageUrl);
    await admin.from("products").update({ video_url: null }).eq("video_url", imageUrl);
    await admin.from("categories").update({ thumbnail_url: null }).eq("thumbnail_url", imageUrl);
    await admin.from("product_demo_links").update({ image_url: null }).eq("image_url", imageUrl);
  }

  // After potentially clearing a DB reference, let's see if this exact URL is used ANYWHERE else.
  const { data: pUsage } = await admin.from("products").select("id").eq("thumbnail_url", imageUrl).limit(1);
  const pUsed = pUsage && pUsage.length > 0;

  const { data: vUsage } = await admin.from("products").select("id").eq("video_url", imageUrl).limit(1);
  const vUsed = vUsage && vUsage.length > 0;

  const { data: cUsage } = await admin.from("categories").select("id").eq("thumbnail_url", imageUrl).limit(1);
  const cUsed = cUsage && cUsage.length > 0;

  const { data: gUsage } = await admin.from("product_images").select("id").eq("image_url", imageUrl).limit(1);
  const gUsed = gUsage && gUsage.length > 0;

  const { data: dUsage } = await admin.from("product_demo_links").select("id").or(`image_url.eq.${imageUrl},url.eq.${imageUrl}`).limit(1);
  const dUsed = dUsage && dUsage.length > 0;

  const isUsedElsewhere = pUsed || vUsed || cUsed || gUsed || dUsed;


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

export async function uploadMedia(formData: FormData) {
  const admin = createAdminClient();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return { error: "Tidak ada file yang dipilih untuk diunggah." };
  }

  const uploadedItems = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    // Clean file extension and name
    const nameParts = file.name.split(".");
    const ext = nameParts.length > 1 ? nameParts.pop() : "";
    const cleanName = nameParts.join(".").replace(/[^\w-]/g, "_");
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const fileName = `${cleanName}-${timestamp}-${randomStr}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError.message);
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: publicUrl } = admin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    uploadedItems.push({
      id: `unused-${fileName}`,
      type: "unused",
      product_id: null,
      product_title: fileName,
      image_url: publicUrl.publicUrl,
      created_at: new Date().toISOString(),
      size: file.size,
      file_name: fileName,
    });
  }

  revalidatePath("/admin/media");

  if (uploadedItems.length === 0 && errors.length > 0) {
    return { error: `Gagal mengunggah file: ${errors.join(", ")}` };
  }

  return {
    success: true,
    uploadedItems,
    errors: errors.length > 0 ? errors : undefined,
  };
}

