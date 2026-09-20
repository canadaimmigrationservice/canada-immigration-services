import { supabase } from "../lib/supabase";

export async function getVisibleVisaServices() {
  const { data, error } = await supabase
    .from("visa_services")
    .select(
      "id, name, slug, short_description, description, display_order"
    )
    .eq("is_active", true)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getVisaServiceBySlug(slug) {
  if (!slug) {
    return null;
  }

  const { data, error } = await supabase
    .from("visa_services")
    .select(
      "id, name, slug, short_description, description, display_order"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
