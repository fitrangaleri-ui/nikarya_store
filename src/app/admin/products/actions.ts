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
  const demoLinksRaw = formData.get("demoLinks") as string;
  let demoLinks: { label: string; url: string; image_url?: string }[] = [];
  try {
    if (demoLinksRaw) demoLinks = JSON.parse(demoLinksRaw);
  } catch { /* ignore parse errors */ }

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
  const existingThumbnail = (formData.get("existingThumbnail") as string) || "";

  let thumbnailUrl = existingThumbnail;

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

  const { data: inserted, error } = await admin.from("products").insert({
    title,
    slug,
    description,
    price,
    discount_price: discountPrice,
    sku,
    tags: tags.length > 0 ? tags : null,
    category_id: categoryId || null,
    drive_file_url: driveFileUrl,
    is_active: isActive,
    thumbnail_url: thumbnailUrl || null,
  }).select("id").single();

  if (error || !inserted) {
    return { error: error?.message || "Insert failed" };
  }

  // Insert demo links
  if (demoLinks.length > 0) {
    const demoRows = demoLinks.map((d, i) => ({
      product_id: inserted.id,
      label: d.label || `Demo ${i + 1}`,
      url: d.url,
      image_url: d.image_url || null,
      sort_order: i,
    }));
    await admin.from("product_demo_links").insert(demoRows);
  }

  // Handle gallery images (files uploaded from form)
  const galleryFiles = formData.getAll("galleryFiles") as File[];
  const mediaGalleryUrlsRaw = formData.get("mediaGalleryUrls") as string;
  let mediaGalleryUrls: string[] = [];
  try {
    if (mediaGalleryUrlsRaw) mediaGalleryUrls = JSON.parse(mediaGalleryUrlsRaw);
  } catch { /* ignore */ }

  let sortOrder = 0;

  // Upload new gallery files
  for (const file of galleryFiles) {
    if (!file || file.size === 0) continue;
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${inserted.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Gallery upload error:", uploadError.message);
      continue;
    }

    const { data: publicUrl } = admin.storage.from("product-images").getPublicUrl(fileName);
    await admin.from("product_images").insert({
      product_id: inserted.id,
      image_url: publicUrl.publicUrl,
      sort_order: sortOrder++,
    });
  }

  // Register media URLs as gallery images (no upload needed, already in storage)
  for (const url of mediaGalleryUrls) {
    await admin.from("product_images").insert({
      product_id: inserted.id,
      image_url: url,
      sort_order: sortOrder++,
    });
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
  const demoLinksRaw = formData.get("demoLinks") as string;
  let demoLinks: { label: string; url: string; image_url?: string }[] = [];
  try {
    if (demoLinksRaw) demoLinks = JSON.parse(demoLinksRaw);
  } catch { /* ignore parse errors */ }

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
      discount_price: discountPrice,
      sku,
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

  // Replace demo links: delete old, insert new
  await admin.from("product_demo_links").delete().eq("product_id", productId);
  if (demoLinks.length > 0) {
    const demoRows = demoLinks.map((d, i) => ({
      product_id: productId,
      label: d.label || `Demo ${i + 1}`,
      url: d.url,
      image_url: d.image_url || null,
      sort_order: i,
    }));
    await admin.from("product_demo_links").insert(demoRows);
  }

  // Handle gallery images
  const galleryFiles = formData.getAll("galleryFiles") as File[];
  const existingGalleryUrlsRaw = formData.get("existingGalleryUrls") as string;
  const mediaGalleryUrlsRaw = formData.get("mediaGalleryUrls") as string;

  let existingGalleryUrls: string[] = [];
  let mediaGalleryUrls: string[] = [];
  try {
    if (existingGalleryUrlsRaw) existingGalleryUrls = JSON.parse(existingGalleryUrlsRaw);
  } catch { /* ignore */ }
  try {
    if (mediaGalleryUrlsRaw) mediaGalleryUrls = JSON.parse(mediaGalleryUrlsRaw);
  } catch { /* ignore */ }

  // Get current gallery images in DB
  const { data: currentGallery } = await admin
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", productId);

  // Delete gallery images that are no longer in the existing list
  const keepUrls = new Set(existingGalleryUrls);
  for (const dbImg of (currentGallery || [])) {
    if (!keepUrls.has(dbImg.image_url)) {
      // This image was removed by the user — delete the DB record
      // (storage file cleanup is handled by deleteGalleryImage or media page)
      await admin.from("product_images").delete().eq("id", dbImg.id);
    }
  }

  // Update sort_order for remaining existing gallery images
  let sortOrder = 0;
  for (const url of existingGalleryUrls) {
    await admin.from("product_images")
      .update({ sort_order: sortOrder++ })
      .eq("product_id", productId)
      .eq("image_url", url);
  }

  // Upload new gallery files
  for (const file of galleryFiles) {
    if (!file || file.size === 0) continue;
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${productId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Gallery upload error:", uploadError.message);
      continue;
    }

    const { data: publicUrl } = admin.storage.from("product-images").getPublicUrl(fileName);
    await admin.from("product_images").insert({
      product_id: productId,
      image_url: publicUrl.publicUrl,
      sort_order: sortOrder++,
    });
  }

  // Register media URLs as gallery images
  for (const url of mediaGalleryUrls) {
    await admin.from("product_images").insert({
      product_id: productId,
      image_url: url,
      sort_order: sortOrder++,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
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

export async function duplicateProduct(productId: string) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // Fetch the original product
  const { data: original, error: fetchError } = await admin
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (fetchError || !original) {
    return { error: fetchError?.message || "Product not found" };
  }

  // Generate unique slug
  const baseSlug = original.slug || slugify(original.title);
  const newSlug = `${baseSlug}-copy-${Date.now()}`;

  // Insert the duplicated product
  const { data: inserted, error: insertError } = await admin
    .from("products")
    .insert({
      title: `${original.title} (Salinan)`,
      slug: newSlug,
      description: original.description,
      price: original.price,
      discount_price: original.discount_price,
      sku: original.sku ? `${original.sku}-COPY` : null,
      tags: original.tags,
      category_id: original.category_id,
      drive_file_url: original.drive_file_url,
      is_active: false, // Start as inactive so admin can review
      thumbnail_url: original.thumbnail_url, // Reuse the same image URL
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message || "Duplicate failed" };
  }

  // Duplicate demo links
  const { data: demoLinks } = await admin
    .from("product_demo_links")
    .select("label, url, image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order");

  if (demoLinks && demoLinks.length > 0) {
    const demoRows = demoLinks.map((d) => ({
      product_id: inserted.id,
      label: d.label,
      url: d.url,
      image_url: d.image_url,
      sort_order: d.sort_order,
    }));
    await admin.from("product_demo_links").insert(demoRows);
  }

  // Duplicate gallery images
  const { data: galleryImages } = await admin
    .from("product_images")
    .select("image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order");

  if (galleryImages && galleryImages.length > 0) {
    const galleryRows = galleryImages.map((img) => ({
      product_id: inserted.id,
      image_url: img.image_url,
      sort_order: img.sort_order,
    }));
    await admin.from("product_images").insert(galleryRows);
  }

  revalidatePath("/admin/products");
  return { success: true, newProductId: inserted.id };
}

export async function uploadGalleryImages(productId: string, formData: FormData) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const files = formData.getAll("gallery") as File[];

  if (!files || files.length === 0) {
    return { error: "No files selected" };
  }

  // Get current max sort_order
  const { data: existing } = await admin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${productId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Gallery upload error:", uploadError.message);
      continue;
    }

    const { data: publicUrl } = admin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    // Insert into product_images table
    await admin.from("product_images").insert({
      product_id: productId,
      image_url: publicUrl.publicUrl,
      sort_order: sortOrder++,
    });

    uploadedUrls.push(publicUrl.publicUrl);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true, urls: uploadedUrls };
}

export async function deleteGalleryImage(imageId: string) {
  const user = await verifyAdmin();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // Look up the image record
  const { data: image } = await admin
    .from("product_images")
    .select("image_url, product_id")
    .eq("id", imageId)
    .single();

  if (image?.image_url) {
    // Check if this URL is used by another record (e.g. as a thumbnail)
    const { data: otherUsage } = await admin
      .from("product_images")
      .select("id")
      .eq("image_url", image.image_url)
      .neq("id", imageId)
      .limit(1);

    const { data: thumbUsage } = await admin
      .from("products")
      .select("id")
      .eq("thumbnail_url", image.image_url)
      .limit(1);

    const isUsedElsewhere =
      (otherUsage && otherUsage.length > 0) ||
      (thumbUsage && thumbUsage.length > 0);

    // Only delete from storage if not used elsewhere
    if (!isUsedElsewhere) {
      const fileName = image.image_url.split("/").pop();
      if (fileName) {
        const decodedName = decodeURIComponent(fileName.split("?")[0]);
        await admin.storage.from("product-images").remove([decodedName]);
      }
    }
  }

  // Delete the DB record
  const { error } = await admin
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  if (image?.product_id) {
    revalidatePath(`/admin/products/${image.product_id}/edit`);
  }
  return { success: true };
}

