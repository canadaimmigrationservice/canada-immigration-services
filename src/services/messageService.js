import { supabase } from "../lib/supabase";

export async function getApplicantMessages(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke(
    "get-application-messages",
    {
      body: {
        application_id: applicationId
      }
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    return [];
  }

  return data.messages || [];
}
