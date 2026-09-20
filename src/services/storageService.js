import { supabase } from "../lib/supabase";

export async function uploadApplicantDocument(
  applicationId,
  file
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!file) {
    throw new Error("A file is required.");
  }

  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

  const filePath = `${applicationId}/${crypto.randomUUID()}-${safeFileName}`;

  const { error } = await supabase.storage
    .from("applicant-documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  return {
    storagePath: filePath,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  };
}

export async function uploadWebsiteAsset(file, folder = "general") {
  if (!file) {
    throw new Error("A file is required.");
  }

  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

  const filePath = `${folder}/${crypto.randomUUID()}-${safeFileName}`;

  const { error } = await supabase.storage
    .from("website-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("website-assets")
    .getPublicUrl(filePath);

  return {
    storagePath: filePath,
    fileName: file.name,
    publicUrl: data.publicUrl
  };
}
