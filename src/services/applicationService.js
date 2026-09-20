import { supabase } from "../lib/supabase";

export async function getAdminApplications(filters = {}) {
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    const search = filters.search.trim();

    query = query.or(
      `full_name.ilike.%${search}%,surname.ilike.%${search}%,application_number.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  if (filters.applicationStatus) {
    query = query.eq(
      "application_status",
      filters.applicationStatus
    );
  }

  if (filters.decisionStatus) {
    query = query.eq(
      "decision_status",
      filters.decisionStatus
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      error.message || "Applications could not be loaded."
    );
  }

  return data || [];
}

export async function getAdminApplicationById(applicationId) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message || "The application could not be loaded."
    );
  }

  return data;
}

export async function updateAdminApplication(
  applicationId,
  updates
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Application updates are required.");
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "The application could not be updated."
    );
  }

  return data;
}

export async function assignApplicationNumber(
  applicationId,
  applicationNumber
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const normalizedNumber = applicationNumber?.trim();

  if (!normalizedNumber) {
    throw new Error("Application Number is required.");
  }

  const { data, error } = await supabase
    .from("applications")
    .update({
      application_number: normalizedNumber
    })
    .eq("id", applicationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The Application Number could not be assigned."
    );
  }

  return data;
}

export async function updateApplicationProcessing(
  applicationId,
  processingData
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const allowedFields = [
    "application_status",
    "eligibility_status",
    "background_check_status",
    "biometrics_status",
    "medical_status",
    "additional_documents_status"
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(processingData, field)) {
      updates[field] = processingData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No processing status changes were provided.");
  }

  return updateAdminApplication(applicationId, updates);
}

export async function updateApplicationDecision(
  applicationId,
  decisionStatus
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!decisionStatus) {
    throw new Error("Decision status is required.");
  }

  return updateAdminApplication(applicationId, {
    decision_status: decisionStatus
  });
}

export async function updatePassportInstructions(
  applicationId,
  passportInstructions
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  return updateAdminApplication(applicationId, {
    passport_instructions:
      passportInstructions?.trim() || null
  });
}

export async function deleteAdminApplication(applicationId) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId);

  if (error) {
    throw new Error(
      error.message || "The application could not be deleted."
    );
  }
}
