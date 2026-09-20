import { supabase } from "../lib/supabase";

export async function getAdminWebsiteSettings() {
  const { data, error } = await supabase
    .from("website_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    throw new Error(
      error.message ||
        "Website settings could not be loaded."
    );
  }

  return data || [];
}

export async function getWebsiteSetting(key) {
  if (!key?.trim()) {
    throw new Error("Setting key is required.");
  }

  const { data, error } = await supabase
    .from("website_settings")
    .select("*")
    .eq("key", key.trim())
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be loaded."
    );
  }

  return data;
}

export async function createWebsiteSetting(settingData) {
  if (!settingData?.key?.trim()) {
    throw new Error("Setting key is required.");
  }

  const { data, error } = await supabase
    .from("website_settings")
    .insert({
      key: settingData.key.trim(),
      value: settingData.value ?? null,
      description:
        settingData.description?.trim() || null
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be created."
    );
  }

  return data;
}

export async function updateWebsiteSetting(
  settingId,
  updates
) {
  if (!settingId) {
    throw new Error("Setting ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Setting updates are required.");
  }

  const cleanUpdates = {};

  if (
    Object.prototype.hasOwnProperty.call(updates, "key")
  ) {
    if (!updates.key?.trim()) {
      throw new Error("Setting key is required.");
    }

    cleanUpdates.key = updates.key.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(updates, "value")
  ) {
    cleanUpdates.value = updates.value ?? null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "description"
    )
  ) {
    cleanUpdates.description =
      updates.description?.trim() || null;
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No setting changes were provided.");
  }

  const { data, error } = await supabase
    .from("website_settings")
    .update(cleanUpdates)
    .eq("id", settingId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be updated."
    );
  }

  return data;
}

export async function deleteWebsiteSetting(settingId) {
  if (!settingId) {
    throw new Error("Setting ID is required.");
  }

  const { error } = await supabase
    .from("website_settings")
    .delete()
    .eq("id", settingId);

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be deleted."
    );
  }
}
