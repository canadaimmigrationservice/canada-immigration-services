import { supabase } from "../lib/supabase";

export async function getVisibleVisaDocuments(applicationId) {
  if (!applicationId) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke(
    "get-visa-documents",
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

  return data.documents || [];
}
