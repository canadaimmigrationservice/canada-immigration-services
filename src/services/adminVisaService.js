import { supabase } from "../lib/supabase";

export async function getAdminVisaServices() {
  const { data, error } = await supabase
    .from("visa_services")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      error.message || "Visa services could not be loaded."
    );
  }

  return data || [];
}

export async function createVisaService(serviceData) {
  if (!serviceData?.name?.trim()) {
    throw new Error("Visa service name is required.");
  }

  if (!serviceData?.slug?.trim()) {
    throw new Error("Visa service slug is required.");
  }

  const { data, error } = await supabase
    .from("visa_services")
    .insert({
      name: serviceData.name.trim(),
      slug: serviceData.slug.trim(),
      short_description:
        serviceData.short_description?.trim() || null,
      description: serviceData.description?.trim() || null,
      requirements: serviceData.requirements?.trim() || null,
      processing_time:
        serviceData.processing_time?.trim() || null,
      display_order:
        Number.isFinite(Number(serviceData.display_order))
          ? Number(serviceData.display_order)
          : 0,
      is_active: serviceData.is_active !== false
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "The visa service could not be created."
    );
  }

  return data;
}

export async function updateVisaService(
  serviceId,
  serviceData
) {
  if (!serviceId) {
    throw new Error("Visa service ID is required.");
  }

  if (!serviceData?.name?.trim()) {
    throw new Error("Visa service name is required.");
  }

  if (!serviceData?.slug?.trim()) {
    throw new Error("Visa service slug is required.");
  }

  const updates = {
    name: serviceData.name.trim(),
    slug: serviceData.slug.trim(),
    short_description:
      serviceData.short_description?.trim() || null,
    description: serviceData.description?.trim() || null,
    requirements: serviceData.requirements?.trim() || null,
    processing_time:
      serviceData.processing_time?.trim() || null,
    display_order:
      Number.isFinite(Number(serviceData.display_order))
        ? Number(serviceData.display_order)
        : 0,
    is_active: serviceData.is_active !== false
  };

  const { data, error } = await supabase
    .from("visa_services")
    .update(updates)
    .eq("id", serviceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "The visa service could not be updated."
    );
  }

  return data;
}

export async function deleteVisaService(serviceId) {
  if (!serviceId) {
    throw new Error("Visa service ID is required.");
  }

  const { error } = await supabase
    .from("visa_services")
    .delete()
    .eq("id", serviceId);

  if (error) {
    throw new Error(
      error.message || "The visa service could not be deleted."
    );
  }
}

export async function setVisaServiceActive(
  serviceId,
  isActive
) {
  if (!serviceId) {
    throw new Error("Visa service ID is required.");
  }

  const { data, error } = await supabase
    .from("visa_services")
    .update({
      is_active: Boolean(isActive)
    })
    .eq("id", serviceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        "The visa service status could not be updated."
    );
  }

  return data;
}
