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

  if (!data?.success || !data?.application) {
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

  if (!data?.success || !data?.application) {
    return null;
  }

  return {
    ...data.application,
    messages: data.messages || [],
    applicant_documents: data.applicant_documents || [],
    visa_documents: data.visa_documents || []
  };
}
