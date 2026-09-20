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
    query = query.eq(
      "document_type",
      filters.documentType.trim()
    );
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

async function runAdminDocumentAction(body) {
  const { data, error } = await supabase.functions.invoke(
    "admin-document-action",
    {
      body
    }
  );

  if (error) {
    throw new Error(
      error.message ||
        "The administrator document action could not be completed."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "The administrator document action could not be completed."
    );
  }

  return data;
}

export async function deleteAdminApplicantDocument(
  documentId
) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const { data: document, error: fetchError } =
    await supabase
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
    throw new Error(
      "Applicant document could not be found."
    );
  }

  if (document.storage_path) {
    await runAdminDocumentAction({
      action: "delete",
      bucket: "applicant-documents",
      storage_path: document.storage_path
    });
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

export async function getAdminDocumentSignedUrl(
  storagePath
) {
  if (!storagePath?.trim()) {
    throw new Error("Storage path is required.");
  }

  const result = await runAdminDocumentAction({
    action: "signed-url",
    bucket: "applicant-documents",
    storage_path: storagePath.trim(),
    expires_in: 300
  });

  return result.signed_url;
}

export async function uploadAdminApplicantDocument({
  applicationId,
  file,
  storagePath
}) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("A document file is required.");
  }

  if (!storagePath?.trim()) {
    throw new Error("Storage path is required.");
  }

  const formData = new FormData();

  formData.append("action", "upload");
  formData.append(
    "bucket",
    "applicant-documents"
  );
  formData.append(
    "storage_path",
    storagePath.trim()
  );
  formData.append(
    "application_id",
    applicationId
  );
  formData.append("file", file);

  const { data, error } =
    await supabase.functions.invoke(
      "admin-document-action",
      {
        body: formData
      }
    );

  if (error) {
    throw new Error(
      error.message ||
        "The applicant document could not be uploaded."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "The applicant document could not be uploaded."
    );
  }

  return data;
}
