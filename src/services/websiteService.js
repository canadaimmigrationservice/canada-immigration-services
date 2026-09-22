import { supabase } from "../lib/supabase";

export async function getPublicWebsiteSettings() {
  const { data, error } = await supabase
    .from("website_settings")
    .select("setting_key, setting_value")
    .order("setting_key", { ascending: true });

  if (error) {
    throw new Error(
      error.message ||
        "Website settings could not be loaded."
    );
  }

  return data || [];
}

export async function getPublicWebsiteSetting(
  key
) {
  const cleanKey = key?.trim();

  if (!cleanKey) {
    return null;
  }

  const { data, error } = await supabase
    .from("website_settings")
    .select("setting_key, setting_value")
    .eq("setting_key", cleanKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        "The website setting could not be loaded."
    );
  }

  return data;
}

export function settingsToObject(
  settings = []
) {
  return settings.reduce(
    (result, setting) => {
      if (!setting?.setting_key) {
        return result;
      }

      result[setting.setting_key] =
        setting.setting_value;

      return result;
    },
    {}
  );
}

export function getSettingValue(
  settings,
  key,
  fallback = null
) {
  if (!Array.isArray(settings)) {
    return fallback;
  }

  const cleanKey = key?.trim();

  if (!cleanKey) {
    return fallback;
  }

  const setting = settings.find(
    (item) =>
      item?.setting_key === cleanKey
  );

  return (
    setting?.setting_value ?? fallback
  );
}
