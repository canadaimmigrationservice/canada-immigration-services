import { supabase } from "../lib/supabase";

const EMAIL_SETTING_FIELDS = [
  "notifications_enabled",
  "admin_email",
  "applicant_application_submitted",
  "applicant_application_number_assigned",
  "applicant_status_changed",
  "applicant_document_requested",
  "applicant_document_received",
  "applicant_message_received",
  "applicant_decision_updated",
  "applicant_passport_instructions",
  "applicant_visa_document_available",
  "admin_new_application",
  "admin_applicant_document_uploaded"
];

function cleanEmailSettings(settings) {
  if (!settings || typeof settings !== "object") {
    return {};
  }

  const cleaned = {};

  for (const field of EMAIL_SETTING_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(
        settings,
        field
      )
    ) {
      cleaned[field] = settings[field];
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleaned,
      "admin_email"
    )
  ) {
    cleaned.admin_email =
      cleaned.admin_email?.trim() || null;
  }

  return cleaned;
}

export async function getAdminEmailSettings() {
  const { data, error } = await supabase
    .from("email_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        "Email settings could not be loaded."
    );
  }

  return data ? [data] : [];
}

export async function createEmailSetting(
  settingData
) {
  const cleanSettings =
    cleanEmailSettings(settingData);

  const { data, error } = await supabase
    .from("email_settings")
    .insert(cleanSettings)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The email settings could not be created."
    );
  }

  return data;
}

export async function updateEmailSetting(
  settingId,
  updates
) {
  if (!settingId) {
    throw new Error(
      "Email setting ID is required."
    );
  }

  if (!updates || typeof updates !== "object") {
    throw new Error(
      "Email setting updates are required."
    );
  }

  const cleanUpdates =
    cleanEmailSettings(updates);

  if (
    Object.keys(cleanUpdates).length === 0
  ) {
    throw new Error(
      "No email setting changes were provided."
    );
  }

  const { data, error } = await supabase
    .from("email_settings")
    .update({
      ...cleanUpdates,
      updated_at: new Date().toISOString()
    })
    .eq("id", settingId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The email settings could not be updated."
    );
  }

  return data;
}

export async function deleteEmailSetting(
  settingId
) {
  if (!settingId) {
    throw new Error(
      "Email setting ID is required."
    );
  }

  const { error } = await supabase
    .from("email_settings")
    .delete()
    .eq("id", settingId);

  if (error) {
    throw new Error(
      error.message ||
        "The email settings could not be deleted."
    );
  }
}
