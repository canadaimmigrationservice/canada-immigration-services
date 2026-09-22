import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

async function sendInternalEmail({
  supabaseUrl,
  serviceRoleKey,
  recipient,
  subject,
  message,
  eventType
}: {
  supabaseUrl: string;
  serviceRoleKey: string;
  recipient: string;
  subject: string;
  message: string;
  eventType: string;
}) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/send-email-notification`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient,
        subject,
        message,
        event_type: eventType
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.error ||
        "The email notification could not be sent."
    );
  }

  return data;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed."
      },
      405
    );
  }

  try {
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          error:
            "Server configuration is incomplete."
        },
        500
      );
    }

    const body = await request.json();
    const applicationData = body?.application;

    if (
      !applicationData ||
      typeof applicationData !== "object"
    ) {
      return jsonResponse(
        {
          error:
            "Application information is required."
        },
        400
      );
    }

    const fullName =
      cleanString(
        applicationData.full_name
      );

    const surname =
      cleanString(
        applicationData.surname
      );

    const email =
      cleanString(
        applicationData.email
      );

    const phone =
      cleanString(
        applicationData.phone
      );

    const nationality =
      cleanString(
        applicationData.nationality
      );

    const countryOfOrigin =
      cleanString(
        applicationData.country_of_origin
      );

    const visaType =
      cleanString(
        applicationData.visa_type
      );

    const destinationCountry =
      cleanString(
        applicationData.destination_country
      );

    const countryOfProcessing =
      cleanString(
        applicationData.country_of_processing
      );

    if (
      !fullName ||
      !surname ||
      !email ||
      !phone ||
      !nationality ||
      !countryOfOrigin ||
      !visaType ||
      !destinationCountry ||
      !countryOfProcessing
    ) {
      return jsonResponse(
        {
          error:
            "Please complete all required application fields."
        },
        400
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );

    const {
      data,
      error
    } = await supabaseAdmin
      .from("applications")
      .insert({
        full_name: fullName,
        surname,
        date_of_birth:
          applicationData.date_of_birth ||
          null,
        gender:
          applicationData.gender ||
          null,
        nationality,
        country_of_origin:
          countryOfOrigin,
        email,
        phone,
        residential_address:
          applicationData.residential_address ||
          null,
        occupation:
          applicationData.occupation ||
          null,
        passport_number:
          applicationData.passport_number ||
          null,
        passport_issue_date:
          applicationData.passport_issue_date ||
          null,
        passport_expiry_date:
          applicationData.passport_expiry_date ||
          null,
        visa_type: visaType,
        work_permit_type:
          applicationData.work_permit_type ||
          null,
        destination_country:
          destinationCountry,
        country_of_processing:
          countryOfProcessing,
        application_date:
          applicationData.application_date ||
          null,
        services_requested:
          Array.isArray(
            applicationData.services_requested
          )
            ? applicationData.services_requested
            : [],
        application_status:
          "Submitted",
        eligibility_status:
          "Not Started",
        background_check_status:
          "Not Started",
        biometrics_status:
          "Not Received",
        medical_status:
          "Not Required",
        additional_documents_status:
          "No Additional Documents Requested",
        decision_status:
          "Pending"
      })
      .select(
        "id, application_number, full_name, surname, email, phone, visa_type, destination_country, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Application insert error:",
        error
      );

      return jsonResponse(
        {
          error:
            "The application could not be submitted."
        },
        500
      );
    }

    const applicantMessage = `Dear ${fullName},

Your application has been successfully received by Canada Immigration Services.

Application Status: Submitted

Visa Type: ${visaType}
Destination Country: ${destinationCountry}

Your application is now awaiting administrative processing. Your Application Number will be assigned separately by the administrator.

Please keep this email for your records.

Canada Immigration Services`;

    try {
      await sendInternalEmail({
        supabaseUrl,
        serviceRoleKey,
        recipient: email,
        subject:
          "Application Submitted Successfully",
        message:
          applicantMessage,
        eventType:
          "application_submitted"
      });
    } catch (emailError) {
      console.error(
        "Applicant submission email failed:",
        emailError
      );
    }

    const {
      data: emailSettings,
      error: emailSettingsError
    } = await supabaseAdmin
      .from("email_settings")
      .select(
        "admin_email, notifications_enabled"
      )
      .limit(1)
      .maybeSingle();

    if (
      emailSettingsError
    ) {
      console.error(
        "Admin email settings could not be loaded:",
        emailSettingsError
      );
    }

    const adminEmail =
      cleanString(
        emailSettings?.admin_email
      );

    if (
      emailSettings?.notifications_enabled !== false &&
      adminEmail
    ) {
      const adminMessage = `A new immigration application has been submitted.

Applicant Name: ${fullName} ${surname}
Email: ${email}
Phone: ${phone}
Nationality: ${nationality}
Country of Origin: ${countryOfOrigin}
Visa Type: ${visaType}
Destination Country: ${destinationCountry}
Country of Processing: ${countryOfProcessing}

Application Status: Submitted

Please log in to the administrator dashboard to review the application and assign an Application Number.

Canada Immigration Services`;

      try {
        await sendInternalEmail({
          supabaseUrl,
          serviceRoleKey,
          recipient:
            adminEmail,
          subject:
            "New Immigration Application Submitted",
          message:
            adminMessage,
          eventType:
            "admin_application_submitted"
        });
      } catch (emailError) {
        console.error(
          "Admin submission email failed:",
          emailError
        );
      }
    }

    return jsonResponse({
      success: true,
      application: data
    });
  } catch (error) {
    console.error(
      "Submit application error:",
      error
    );

    return jsonResponse(
      {
        error:
          "The application could not be processed."
      },
      500
    );
  }
});
