import { supabase } from "../lib/supabase";

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      error.message || "Admin users could not be loaded."
    );
  }

  return data || [];
}

export async function getAdminUserById(userId) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(
      error.message || "Admin user could not be loaded."
    );
  }

  return data;
}

export async function updateAdminUser(userId, updates) {
  const { data, error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || "Admin user could not be updated."
    );
  }

  return data;
}

export async function deleteAdminUser(userId) {
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(
      error.message || "Admin user could not be deleted."
    );
  }

  return true;
}

export async function createAdminUser(userData) {
  const { data, error } = await supabase
    .from("admin_users")
    .insert([userData])
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || "Admin user could not be created."
    );
  }

  return data;
}

export async function updateAdminProfile(userId, updates) {
  return updateAdminUser(userId, updates);
}

export async function deleteAdminProfile(userId) {
  return deleteAdminUser(userId);
}

export async function createAdminProfile(userData) {
  return createAdminUser(userData);
}
