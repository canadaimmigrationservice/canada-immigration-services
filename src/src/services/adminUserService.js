import { supabase } from "../lib/supabase";

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name, role, is_active, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      error.message || "Administrator accounts could not be loaded."
    );
  }

  return data || [];
}

export async function createAdminProfile(profileData) {
  if (!profileData?.id) {
    throw new Error("Administrator user ID is required.");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      id: profileData.id,
      full_name: profileData.full_name?.trim() || null,
      role: profileData.role || "admin",
      is_active: profileData.is_active !== false
    })
    .select("id, full_name, role, is_active, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(
      error.message || "The administrator profile could not be created."
    );
  }

  return data;
}

export async function updateAdminProfile(adminId, updates) {
  if (!adminId) {
    throw new Error("Administrator ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Administrator updates are required.");
  }

  const cleanUpdates = {};

  if (Object.prototype.hasOwnProperty.call(updates, "full_name")) {
    cleanUpdates.full_name = updates.full_name?.trim() || null;
  }

  if (Object.prototype.hasOwnProperty.call(updates, "role")) {
    if (!["admin", "super_admin"].includes(updates.role)) {
      throw new Error("Invalid administrator role.");
    }

    cleanUpdates.role = updates.role;
  }

  if (Object.prototype.hasOwnProperty.call(updates, "is_active")) {
    cleanUpdates.is_active = Boolean(updates.is_active);
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No administrator changes were provided.");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .update(cleanUpdates)
    .eq("id", adminId)
    .select("id, full_name, role, is_active, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(
      error.message || "The administrator profile could not be updated."
    );
  }

  return data;
}

export async function deleteAdminProfile(adminId) {
  if (!adminId) {
    throw new Error("Administrator ID is required.");
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", adminId);

  if (error) {
    throw new Error(
      error.message || "The administrator profile could not be deleted."
    );
  }
}
