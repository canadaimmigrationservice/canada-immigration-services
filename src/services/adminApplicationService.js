import { supabase } from "../lib/supabase";
import { sendEmailNotification } from "./emailNotificationService";

export async function getAdminApplications(filters = {}) {
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    const search = filters.search.trim();

    query = query.or(
      `full_name.ilike.%${search}%,surname.ilike.%${search}%,application_number.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  if (filters.applicationStatus) {
    query = query.eq(
      "application_status",
      filters.applicationStatus
    );
  }

  if (filters.decisionStatus) {
    query = query.eq(
      "decision_status",
      filters.decisionStatus
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      error.message ||
        "Applications could not be loaded."
    );
  }

  return data || [];
}

export async function getAdminApplicationById(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  const { data, error } =
    await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        "The application could not be loaded."
    );
  }

  return data;
}

export async function updateAdminApplication(
  applicationId,
  updates
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Application updates are required."
    );
  }

  const { data, error } =
    await supabase
      .from("applications")
      .update(updates)
      .eq("id", applicationId)
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "The application could not be updated."
    );
  }

  return data;
}

export async function assignApplicationNumber(
  applicationId,
  applicationNumber
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  const normalizedNumber =
    applicationNumber?.trim();

  if (!normalizedNumber) {
    throw new Error(
      "Application Number is required."
    );
  }

  const application =
    await updateAdminApplication(
      applicationId,
      {
        application_number:
          normalizedNumber
      }
    );

  if (application.email) {
    try {
      await sendEmailNotification({
        recipient:
          application.email,
        subject:
          "Your Application Number Has Been Assigned",
        message:
          `Dear ${application.full_name || "Applicant"},\n\n` +
          `Your Application Number has been assigned.\n\n` +
          `Application Number: ${normalizedNumber}\n\n` +
          `Please keep this Application Number safe. You will need it to check your application status.\n\n` +
          `Canada Immigration Services`,
        eventType:
          "application_number_assigned"
      });
    } catch (error) {
      console.error(
        "Application Number email notification failed:",
        error
      );
    }
  }

  return application;
}

export async function updateApplicationProcessing(
  applicationId,
  updates
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Processing updates are required."
    );
  }

  const application =
    await updateAdminApplication(
      applicationId,
      updates
    );

  if (application.email) {
    const changes = [];

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "application_status"
      )
    ) {
      changes.push(
        `Application Status: ${application.application_status}`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "eligibility_status"
      )
    ) {
      changes.push(
        `Eligibility: ${application.eligibility_status}`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "background_check_status"
      )
    ) {
      changes.push(
        `Background Check: ${application.background_check_status}`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "biometrics_status"
      )
    ) {
      changes.push(
        `Biometrics: ${application.biometrics_status}`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "medical_status"
      )
    ) {
      changes.push(
        `Medical: ${application.medical_status}`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "additional_documents_status"
      )
    ) {
      changes.push(
        `Additional Documents: ${application.additional_documents_status}`
      );
    }

    if (changes.length > 0) {
      try {
        await sendEmailNotification({
          recipient:
            application.email,
          subject:
            "Your Application Status Has Been Updated",
          message:
            `Dear ${application.full_name || "Applicant"},\n\n` +
            `There has been an update to your application.\n\n` +
            `${changes.join("\n")}\n\n` +
            `Application Number: ${
              application.application_number ||
              "Not yet assigned"
            }\n\n` +
            `Please check your application for the latest information.\n\n` +
            `Canada Immigration Services`,
          eventType:
            "processing_status_changed"
        });
      } catch (error) {
        console.error(
          "Processing status email notification failed:",
          error
        );
      }
    }
  }

  return application;
}

export async function updateApplicationDecision(
  applicationId,
  updates
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Decision updates are required."
    );
  }

  const application =
    await updateAdminApplication(
      applicationId,
      updates
    );

  if (
    application.email &&
    Object.prototype.hasOwnProperty.call(
      updates,
      "decision_status"
    )
  ) {
    const decision =
      application.decision_status;

    try {
      await sendEmailNotification({
        recipient:
          application.email,
        subject:
          `Application Decision Update`,
        message:
          `Dear ${application.full_name || "Applicant"},\n\n` +
          `There has been an update to the decision on your application.\n\n` +
          `Decision Status: ${decision}\n\n` +
          `${
            application.decision_message ||
            "Please check your application for further information."
          }\n\n` +
          `Application Number: ${
            application.application_number ||
            "Not yet assigned"
          }\n\n` +
          `Canada Immigration Services`,
        eventType:
          "decision_updated"
      });
    } catch (error) {
      console.error(
        "Decision email notification failed:",
        error
      );
    }
  }

  return application;
}

export async function updatePassportInstructions(
  applicationId,
  updates
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Passport instruction updates are required."
    );
  }

  const application =
    await updateAdminApplication(
      applicationId,
      updates
    );

  const hasPassportUpdate =
    Object.prototype.hasOwnProperty.call(
      updates,
      "passport_submission_visible"
    ) ||
    Object.prototype.hasOwnProperty.call(
      updates,
      "passport_submission_instructions"
    );

  if (
    application.email &&
    hasPassportUpdate
  ) {
    try {
      await sendEmailNotification({
        recipient:
          application.email,
        subject:
          "Passport Submission Instructions Updated",
        message:
          `Dear ${application.full_name || "Applicant"},\n\n` +
          `Passport submission information for your application has been updated.\n\n` +
          `${
            application.passport_submission_instructions ||
            "Please check your application for the latest passport submission instructions."
          }\n\n` +
          `Application Number: ${
            application.application_number ||
            "Not yet assigned"
          }\n\n` +
          `Canada Immigration Services`,
        eventType:
          "passport_instructions_updated"
      });
    } catch (error) {
      console.error(
        "Passport instruction email notification failed:",
        error
      );
    }
  }

  return application;
}

export async function deleteAdminApplication(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  const { error } =
    await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

  if (error) {
    throw new Error(
      error.message ||
        "The application could not be deleted."
    );
  }
}
