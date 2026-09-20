import { supabase } from "../lib/supabase";

export async function getAdminApplicantDocuments(filters = {}) {
  let query = supabase
    .from("applicant_documents")
    .select(`
      *,
      applications (
        id,
        application_number,
        full_name,
        surname,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.documentType?.trim()) {
    query = query.eq("document_type", filters.documentType.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      error.message ||
        "Applicant documents could not be loaded."
    );
  }

  return data || [];
}

export async function deleteAdminApplicantDocument(
  documentId
) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const { data: document, error: fetchError } = await supabase
    .from("applicant_documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      fetchError.message ||
        "The applicant document could not be loaded."
    );
  }

  if (!document) {
    throw new Error("Applicant document could not be found.");
  }

  if (document.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("applicant-documents")
      .remove([document.storage_path]);

    if (storageError) {
      throw new Error(
        storageError.message ||
          "The document file could not be removed."
      );
    }
  }

  const { error } = await supabase
    .from("applicant_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(
      error.message ||
        "The applicant document record could not be deleted."
    );
  }
}
