import { supabase } from "../lib/supabase";

export async function getPublicWebsiteSettings() {
  const { data, error } = await supabase
    .from("website_settings")
    .select("key, value, description")
    .order("key", { ascending: true });

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
  if (!key?.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("website_settings")
    .select("key, value, description")
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

export function settingsToObject(
  settings = []
) {
  return settings.reduce(
    (result, setting) => {
      result[setting.key] = setting.value;
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

  const setting = settings.find(
    (item) => item.key === key
  );

  return setting?.value ?? fallback;
}
