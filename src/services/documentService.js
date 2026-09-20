import { supabase } from "../lib/supabase";

export async function saveApplicantDocument(
  applicationId,
  document
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!document?.file) {
    throw new Error("Document file is required.");
  }

  const formData = new FormData();

  formData.append("application_id", applicationId);
  formData.append("file", document.file);

  const { data, error } = await supabase.functions.invoke(
    "upload-applicant-document",
    {
      body: formData
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error || "The document could not be uploaded."
    );
  }

  return data.document;
}

export async function getApplicantDocuments(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke(
    "get-applicant-documents",
    {
      body: {
        application_id: applicationId
      }
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    return [];
  }

  return data.documents || [];
}
