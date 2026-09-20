import { supabase } from "../lib/supabase";

export async function getWebsiteSetting(settingKey) {
  if (!settingKey) {
    return null;
  }

  const { data, error } = await supabase
    .from("website_settings")
    .select("setting_key, setting_value")
    .eq("setting_key", settingKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.setting_value ?? null;
}

export async function getWebsiteSettings() {
  const { data, error } = await supabase
    .from("website_settings")
    .select("setting_key, setting_value")
    .order("setting_key", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}
