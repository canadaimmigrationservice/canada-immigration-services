import { supabase } from "../lib/supabase";

export async function getAdminEmailSettings() {
  const { data, error } = await supabase
    .from("email_settings")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      error.message ||
        "Email settings could not be loaded."
    );
  }

  return data || [];
}

export async function createEmailSetting(settingData) {
  if (!settingData?.provider?.trim()) {
    throw new Error("Email provider is required.");
  }

  const { data, error } = await supabase
    .from("email_settings")
    .insert({
      provider: settingData.provider.trim(),
      is_enabled: settingData.is_enabled !== false,
      admin_email: settingData.admin_email?.trim() || null,
      sender_name: settingData.sender_name?.trim() || null,
      configuration: settingData.configuration || {}
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The email setting could not be created."
    );
  }

  return data;
}

export async function updateEmailSetting(
  settingId,
  updates
) {
  if (!settingId) {
    throw new Error("Email setting ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Email setting updates are required.");
  }

  const allowedFields = [
    "provider",
    "is_enabled",
    "admin_email",
    "sender_name",
    "configuration"
  ];

  const cleanUpdates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      cleanUpdates[field] = updates[field];
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error(
      "No email setting changes were provided."
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "provider"
    )
  ) {
    if (!cleanUpdates.provider?.trim()) {
      throw new Error("Email provider is required.");
    }

    cleanUpdates.provider =
      cleanUpdates.provider.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "admin_email"
    )
  ) {
    cleanUpdates.admin_email =
      cleanUpdates.admin_email?.trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      cleanUpdates,
      "sender_name"
    )
  ) {
    cleanUpdates.sender_name =
      cleanUpdates.sender_name?.trim() || null;
  }

  const { data, error } = await supabase
    .from("email_settings")
    .update(cleanUpdates)
    .eq("id", settingId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The email setting could not be updated."
    );
  }

  return data;
}

export async function deleteEmailSetting(settingId) {
  if (!settingId) {
    throw new Error("Email setting ID is required.");
  }

  const { error } = await supabase
    .from("email_settings")
    .delete()
    .eq("id", settingId);

  if (error) {
    throw new Error(
      error.message ||
        "The email setting could not be deleted."
    );
  }
}
