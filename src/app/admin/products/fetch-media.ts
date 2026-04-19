"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type MediaPickerItem = {
  file_name: string;
  image_url: string;
  size: number;
  created_at: string;
};

export async function fetchMediaForPicker(): Promise<MediaPickerItem[]> {
  const admin = createAdminClient();

  const { data: files, error } = await admin.storage
    .from("product-images")
    .list(undefined, {
      limit: 10000,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error || !files) return [];

  // Get base URL
  const {
    data: { publicUrl: sampleUrl },
  } = admin.storage.from("product-images").getPublicUrl("sample.jpg");
  const baseUrl = sampleUrl.substring(
    0,
    sampleUrl.lastIndexOf("/sample.jpg")
  );

  const items: MediaPickerItem[] = [];

  for (const file of files) {
    if (file.name === ".emptyFolderPlaceholder") continue;

    const encodedFileName = file.name
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    const fileUrl = `${baseUrl}/${encodedFileName}`;

    items.push({
      file_name: file.name,
      image_url: fileUrl,
      size: file.metadata?.size || 0,
      created_at: file.created_at || new Date().toISOString(),
    });
  }

  return items;
}

export async function uploadMediaDirect(formData: FormData) {
  const admin = createAdminClient();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file provided" };

  const fileExt = file.name.split(".").pop();
  const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { error: uploadError } = await admin.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrl } = admin.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { url: publicUrl.publicUrl };
}
