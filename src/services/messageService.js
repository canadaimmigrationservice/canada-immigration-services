import { supabase } from "../lib/supabase";

export async function getApplicantMessages(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase
    .from("application_messages")
    .select(
      "id, application_id, message, is_visible_to_applicant, created_at, updated_at"
    )
    .eq("application_id", applicationId)
    .eq("is_visible_to_applicant", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}
