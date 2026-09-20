import { supabase } from "../lib/supabase";

export async function createApplication(applicationData) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      full_name: applicationData.full_name,
      surname: applicationData.surname,
      date_of_birth: applicationData.date_of_birth || null,
      gender: applicationData.gender || null,
      nationality: applicationData.nationality || null,
      country_of_origin: applicationData.country_of_origin || null,
      email: applicationData.email || null,
      phone: applicationData.phone || null,
      residential_address: applicationData.residential_address || null,
      occupation: applicationData.occupation || null,

      passport_number: applicationData.passport_number || null,
      passport_issue_date:
        applicationData.passport_issue_date || null,
      passport_expiry_date:
        applicationData.passport_expiry_date || null,

      visa_type: applicationData.visa_type || null,
      work_permit_type: applicationData.work_permit_type || null,
      destination_country:
        applicationData.destination_country || null,
      country_of_processing:
        applicationData.country_of_processing || null,
      application_date:
        applicationData.application_date || null,

      services_requested:
        applicationData.services_requested || []
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
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
   * Applicant application lookups will be moved behind a
   * secure server-side endpoint before this function is used
   * for production applicant data.
   *
   * This prevents sensitive application information from
   * being exposed through the public browser client.
   */

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        application_number,
        full_name,
        surname,
        date_of_birth,
        gender,
        nationality,
        country_of_origin,
        email,
        phone,
        residential_address,
        occupation,
        passport_number,
        passport_issue_date,
        passport_expiry_date,
        visa_type,
        work_permit_type,
        destination_country,
        country_of_processing,
        application_date,
        services_requested,
        application_status,
        eligibility_status,
        background_check_status,
        biometrics_status,
        medical_status,
        additional_documents_status,
        decision_status,
        decision_message,
        passport_submission_visible,
        passport_instructions,
        created_at,
        updated_at
      `
    )
    .eq("application_number", normalizedNumber)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
