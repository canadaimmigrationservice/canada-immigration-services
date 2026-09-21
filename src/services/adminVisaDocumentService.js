import { supabase } from "../lib/supabase";
import { sendEmailNotification } from "./emailNotificationService";

export async function getAdminVisaDocuments(
  filters = {}
) {
  let query = supabase
    .from("visa_documents")
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
    .order("created_at", {
      ascending: false
    });

  if (filters.applicationId) {
    query = query.eq(
      "application_id",
      filters.applicationId
    );
  }

  if (
    filters.visible !== undefined &&
    filters.visible !== ""
  ) {
    query = query.eq(
      "is_visible",
      filters.visible === true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throw new Error(
      error.message ||
        "Visa documents could not be loaded."
    );
  }

  return data || [];
}

async function runAdminDocumentAction(
  body
) {
  const { data, error } =
    await supabase.functions.invoke(
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

async function notifyVisaDocumentAvailable(
  applicationId,
  document
) {
  if (
    !applicationId ||
    !document?.is_visible
  ) {
    return;
  }

  try {
    const { data: application } =
      await supabase
        .from("applications")
        .select(
          "id, application_number, full_name, email"
        )
        .eq(
          "id",
          applicationId
        )
        .maybeSingle();

    if (!application?.email) {
      return;
    }

    await sendEmailNotification({
      recipient:
        application.email,
      subject:
        "A Visa Document Is Available",
      message:
        `Dear ${
          application.full_name ||
          "Applicant"
        },\n\n` +
        `A new visa document is now available for your application.\n\n` +
        `Document: ${
          document.title
        }\n\n` +
        `${
          document.description ||
          "Please log in to check your application and view the available document."
        }\n\n` +
        `Application Number: ${
          application.application_number ||
          "Not yet assigned"
        }\n\n` +
        `Canada Immigration Services`,
      eventType:
        "visa_document_available"
    });
  } catch (error) {
    console.error(
      "Visa document email notification failed:",
      error
    );
  }
}

export async function createVisaDocument(
  documentData
) {
  if (!documentData?.application_id) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (!documentData?.title?.trim()) {
    throw new Error(
      "Document title is required."
    );
  }

  if (!documentData?.storage_path?.trim()) {
    throw new Error(
      "Document storage path is required."
    );
  }

  const { data, error } =
    await supabase
      .from("visa_documents")
      .insert({
        application_id:
          documentData.application_id,
        title:
          documentData.title.trim(),
        description:
          documentData.description?.trim() ||
          null,
        file_name:
          documentData.file_name?.trim() ||
          null,
        storage_path:
          documentData.storage_path.trim(),
        mime_type:
          documentData.mime_type?.trim() ||
          null,
        file_size:
          Number.isFinite(
            Number(
              documentData.file_size
            )
          )
            ? Number(
                documentData.file_size
              )
            : null,
        is_visible:
          documentData.is_visible !==
          false
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "The visa document record could not be created."
    );
  }

  await notifyVisaDocumentAvailable(
    documentData.application_id,
    data
  );

  return data;
}

export async function updateVisaDocument(
  documentId,
  updates
) {
  if (!documentId) {
    throw new Error(
      "Document ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Document updates are required."
    );
  }

  const allowedFields = [
    "title",
    "description",
    "file_name",
    "storage_path",
    "mime_type",
    "file_size",
    "is_visible"
  ];

  const cleanUpdates = {};

  for (
    const field of allowedFields
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        field
      )
    ) {
      cleanUpdates[field] =
        updates[field];
    }
  }

  if (
    Object.keys(cleanUpdates).length ===
    0
  ) {
    throw new Error(
      "No document changes were provided."
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "title"
    )
  ) {
    if (
      !cleanUpdates.title?.trim()
    ) {
      throw new Error(
        "Document title is required."
      );
    }

    cleanUpdates.title =
      cleanUpdates.title.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "description"
    )
  ) {
    cleanUpdates.description =
      cleanUpdates.description?.trim() ||
      null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "file_name"
    )
  ) {
    cleanUpdates.file_name =
      cleanUpdates.file_name?.trim() ||
      null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "storage_path"
    )
  ) {
    if (
      !cleanUpdates.storage_path?.trim()
    ) {
      throw new Error(
        "Document storage path is required."
      );
    }

    cleanUpdates.storage_path =
      cleanUpdates.storage_path.trim();
  }

  const { data: existingDocument } =
    await supabase
      .from("visa_documents")
      .select(
        "id, application_id, is_visible"
      )
      .eq("id", documentId)
      .maybeSingle();

  const { data, error } =
    await supabase
      .from("visa_documents")
      .update(cleanUpdates)
      .eq("id", documentId)
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "The visa document could not be updated."
    );
  }

  const becameVisible =
    !existingDocument?.is_visible &&
    data.is_visible;

  if (becameVisible) {
    await notifyVisaDocumentAvailable(
      data.application_id,
      data
    );
  }

  return data;
}

export async function setVisaDocumentVisibility(
  documentId,
  isVisible
) {
  if (!documentId) {
    throw new Error(
      "Document ID is required."
    );
  }

  const {
    data: existingDocument
  } = await supabase
    .from("visa_documents")
    .select(
      "id, application_id, is_visible"
    )
    .eq("id", documentId)
    .maybeSingle();

  const { data, error } =
    await supabase
      .from("visa_documents")
      .update({
        is_visible:
          Boolean(isVisible)
      })
      .eq("id", documentId)
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "Document visibility could not be updated."
    );
  }

  const becameVisible =
    !existingDocument?.is_visible &&
    data.is_visible;

  if (becameVisible) {
    await notifyVisaDocumentAvailable(
      data.application_id,
      data
    );
  }

  return data;
}

export async function deleteAdminVisaDocument(
  documentId
) {
  if (!documentId) {
    throw new Error(
      "Document ID is required."
    );
  }

  const {
    data: document,
    error: fetchError
  } = await supabase
    .from("visa_documents")
    .select(
      "id, storage_path"
    )
    .eq("id", documentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      fetchError.message ||
        "The visa document could not be loaded."
    );
  }

  if (!document) {
    throw new Error(
      "Visa document could not be found."
    );
  }

  if (document.storage_path) {
    await runAdminDocumentAction({
      action: "delete",
      bucket:
        "visa-documents",
      storage_path:
        document.storage_path
    });
  }

  const { error } =
    await supabase
      .from("visa_documents")
      .delete()
      .eq("id", documentId);

  if (error) {
    throw new Error(
      error.message ||
        "The visa document could not be deleted."
    );
  }
}

export async function getAdminVisaDocumentSignedUrl(
  storagePath
) {
  if (!storagePath?.trim()) {
    throw new Error(
      "Storage path is required."
    );
  }

  const result =
    await runAdminDocumentAction({
      action: "signed-url",
      bucket:
        "visa-documents",
      storage_path:
        storagePath.trim(),
      expires_in: 300
    });

  return result.signed_url;
}

export async function uploadAdminVisaDocument({
  applicationId,
  file,
  storagePath
}) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (!(file instanceof File)) {
    throw new Error(
      "A document file is required."
    );
  }

  if (!storagePath?.trim()) {
    throw new Error(
      "Storage path is required."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "action",
    "upload"
  );

  formData.append(
    "bucket",
    "visa-documents"
  );

  formData.append(
    "storage_path",
    storagePath.trim()
  );

  formData.append(
    "application_id",
    applicationId
  );

  formData.append(
    "file",
    file
  );

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
        "The visa document could not be uploaded."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "The visa document could not be uploaded."
    );
  }

  return data;
}
