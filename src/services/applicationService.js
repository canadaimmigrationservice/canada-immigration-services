import { supabase } from "../lib/supabase";

export async function createApplication(applicationData) {
  if (!applicationData || typeof applicationData !== "object") {
    throw new Error("Application data is required.");
  }

  const {
    files = [],
    ...application
  } = applicationData;

  if (!application.full_name?.trim()) {
    throw new Error("Full Name is required.");
  }

  if (!application.surname?.trim()) {
    throw new Error("Surname is required.");
  }

  if (!application.email?.trim()) {
    throw new Error("Email address is required.");
  }

  if (!application.application_date) {
    application.application_date = new Date()
      .toISOString()
      .split("T")[0];
  }

  const { data, error } = await supabase.functions.invoke(
    "submit-application",
    {
      body: {
        application,
        files
      }
    }
  );

  if (error) {
    throw new Error(
      error.message ||
        "Your application could not be submitted."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "Your application could not be submitted."
    );
  }

  return data.application || data;
}

export async function submitApplication(applicationData) {
  return createApplication(applicationData);
}

export async function getApplicationByNumber(
  applicationNumber
) {
  const normalizedNumber =
    applicationNumber?.trim();

  if (!normalizedNumber) {
    throw new Error("Application Number is required.");
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
    throw new Error(
      error.message ||
        "The application could not be checked."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "Application not found."
    );
  }

  return data;
}
