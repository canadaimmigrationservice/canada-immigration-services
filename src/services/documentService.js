import { supabase } from "../lib/supabase";

export async function saveApplicantDocument(
  applicationId,
  document
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!document?.storagePath) {
    throw new Error("Document storage path is required.");
  }

  const { data, error } = await supabase
    .from("applicant_documents")
    .insert({
      application_id: applicationId,
      file_name: document.fileName,
      storage_path: document.storagePath,
      file_type: document.fileType || null,
      file_size: document.fileSize || null
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getApplicantDocuments(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase
    .from("applicant_documents")
    .select(
      "id, application_id, file_name, storage_path, file_type, file_size, uploaded_at"
    )
    .eq("application_id", applicationId)
    .order("uploaded_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}
