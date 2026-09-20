import { supabase } from "../lib/supabase";

export async function getVisibleVisaDocuments(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase
    .from("visa_documents")
    .select(
      "id, application_id, title, description, storage_path, file_name, file_type, file_size, is_visible_to_applicant, created_at, updated_at"
    )
    .eq("application_id", applicationId)
    .eq("is_visible_to_applicant", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
