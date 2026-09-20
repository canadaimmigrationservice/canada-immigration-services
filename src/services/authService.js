import { supabase } from "../lib/supabase";

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) {
    throw new Error(error.message || "Unable to sign in.");
  }

  if (!data.user) {
    throw new Error("Administrator account could not be verified.");
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from("admin_users")
    .select("id, full_name, role, is_active")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Administrator access could not be verified.");
  }

  if (!adminProfile) {
    await supabase.auth.signOut();
    throw new Error("This account is not authorized to access the administration area.");
  }

  return {
    user: data.user,
    adminProfile
  };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || "Unable to sign out.");
  }
}

export async function getCurrentAdmin() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from("admin_users")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError || !adminProfile) {
    return null;
  }

  return {
    user,
    adminProfile
  };
}

export function subscribeToAuthChanges(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
