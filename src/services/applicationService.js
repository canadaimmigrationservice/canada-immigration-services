import { supabase } from "../lib/supabase";

export async function createApplication(applicationData) {
  const { data, error } = await supabase.functions.invoke(
    "submit-application",
    {
      body: {
        application: applicationData
      }
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error || "The application could not be submitted."
    );
  }

  return data.application;
}

export async function getApplicationByNumber(applicationNumber) {
  if (!applicationNumber) {
    return null;
  }

  const normalizedNumber = applicationNumber.trim();

  if (!normalizedNumber) {
    return null;
  }

  /*
   * Applicant application lookups will be handled through
   * a secure server-side endpoint.
   *
   * Do not query the applications table directly from the
   * public browser client.
   */

  const { data, error } = await supabase.functions.invoke(
    "check-application",
    {
      body: {
        application_number: normalizedNumber
      }
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    return null;
  }

  return data.application || null;
}
