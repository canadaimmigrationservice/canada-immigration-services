import { supabase } from "../lib/supabase";

export async function getAdminWebsiteSettings() {
  const { data, error } = await supabase
    .from("website_settings")
    .select("*")
    .order("key", {
      ascending: true
    });

  if (error) {
    throw new Error(
      error.message ||
        "Website settings could not be loaded."
    );
  }

  return data || [];
}

export async function getWebsiteSetting(
  key
) {
  if (!key?.trim()) {
    return null;
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

export async function createWebsiteSetting(
  setting
) {
  if (!setting?.key?.trim()) {
    throw new Error(
      "Setting key is required."
    );
  }

  const { data, error } = await supabase
    .from("website_settings")
    .insert({
      key: setting.key.trim(),
      value:
        setting.value ?? "",
      description:
        setting.description?.trim() ||
        null
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
  id,
  updates
) {
  if (!id) {
    throw new Error(
      "Website setting ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Website setting updates are required."
    );
  }

  const cleanUpdates = {};

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "key"
    )
  ) {
    if (!updates.key?.trim()) {
      throw new Error(
        "Setting key is required."
      );
    }

    cleanUpdates.key =
      updates.key.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "value"
    )
  ) {
    cleanUpdates.value =
      updates.value ?? "";
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "description"
    )
  ) {
    cleanUpdates.description =
      updates.description?.trim() ||
      null;
  }

  if (
    Object.keys(cleanUpdates)
      .length === 0
  ) {
    throw new Error(
      "No website setting changes were provided."
    );
  }

  const { data, error } = await supabase
    .from("website_settings")
    .update(cleanUpdates)
    .eq("id", id)
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

export async function deleteWebsiteSetting(
  id
) {
  if (!id) {
    throw new Error(
      "Website setting ID is required."
    );
  }

  const { error } = await supabase
    .from("website_settings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be deleted."
    );
  }
}

export async function uploadWebsiteAsset({
  assetType,
  file
}) {
  if (
    assetType !== "logo" &&
    assetType !== "favicon"
  ) {
    throw new Error(
      "Invalid website asset type."
    );
  }

  if (!(file instanceof File)) {
    throw new Error(
      "A website asset file is required."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "asset_type",
    assetType
  );

  formData.append(
    "file",
    file
  );

  const { data, error } =
    await supabase.functions.invoke(
      "admin-website-assets",
      {
        body: formData
      }
    );

  if (error) {
    throw new Error(
      error.message ||
        "The website asset could not be uploaded."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "The website asset could not be uploaded."
    );
  }

  return data;
}
