import { supabase } from "../lib/supabase";

export async function getEmailSettings() {
  const { data, error } = await supabase
    .from("email_settings")
    .select(
      "id, notifications_enabled, admin_email, applicant_notifications_enabled, admin_notifications_enabled, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getEmailLogs(applicationNumber = null) {
  let query = supabase
    .from("email_logs")
    .select(
      "id, recipient, application_number, email_type, sent_at, status, error_message"
    )
    .order("sent_at", { ascending: false });

  if (applicationNumber) {
    query = query.eq("application_number", applicationNumber.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}
