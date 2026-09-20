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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          error: "Server configuration is incomplete."
        },
        500
      );
    }

    const body = await request.json();

    const applicationNumber = cleanString(
      body?.application_number
    );

    if (!applicationNumber) {
      return jsonResponse(
        {
          error: "Application Number is required."
        },
        400
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { data: application, error: applicationError } =
      await supabaseAdmin
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
        .eq("application_number", applicationNumber)
        .maybeSingle();

    if (applicationError) {
      console.error(
        "Application lookup error:",
        applicationError
      );

      return jsonResponse(
        {
          error:
            "The application could not be checked at this time."
        },
        500
      );
    }

    if (!application) {
      return jsonResponse({
        success: false,
        application: null
      });
    }

    const [
      messagesResult,
      applicantDocumentsResult,
      visaDocumentsResult
    ] = await Promise.all([
      supabaseAdmin
        .from("application_messages")
        .select(
          "id, application_id, message, is_visible_to_applicant, created_at, updated_at"
        )
        .eq("application_id", application.id)
        .eq("is_visible_to_applicant", true)
        .order("created_at", { ascending: true }),

      supabaseAdmin
        .from("applicant_documents")
        .select(
          "id, application_id, file_name, storage_path, file_type, file_size, uploaded_at"
        )
        .eq("application_id", application.id)
        .order("uploaded_at", { ascending: true }),

      supabaseAdmin
        .from("visa_documents")
        .select(
          "id, application_id, title, description, storage_path, file_name, file_type, file_size, is_visible_to_applicant, created_at, updated_at"
        )
        .eq("application_id", application.id)
        .eq("is_visible_to_applicant", true)
        .order("created_at", { ascending: false })
    ]);

    if (messagesResult.error) {
      console.error(
        "Messages lookup error:",
        messagesResult.error
      );
    }

    if (applicantDocumentsResult.error) {
      console.error(
        "Applicant documents lookup error:",
        applicantDocumentsResult.error
      );
    }

    if (visaDocumentsResult.error) {
      console.error(
        "Visa documents lookup error:",
        visaDocumentsResult.error
      );
    }

    const applicantDocuments = await Promise.all(
      (applicantDocumentsResult.data || []).map(
        async (document) => {
          const { data: signedUrlData } =
            await supabaseAdmin.storage
              .from("applicant-documents")
              .createSignedUrl(
                document.storage_path,
                300
              );

          return {
            ...document,
            signed_url:
              signedUrlData?.signedUrl || null
          };
        }
      )
    );

    const visaDocuments = await Promise.all(
      (visaDocumentsResult.data || []).map(
        async (document) => {
          const { data: signedUrlData } =
            await supabaseAdmin.storage
              .from("visa-documents")
              .createSignedUrl(
                document.storage_path,
                300
              );

          return {
            ...document,
            signed_url:
              signedUrlData?.signedUrl || null
          };
        }
      )
    );

    return jsonResponse({
      success: true,
      application,
      messages: messagesResult.data || [],
      applicant_documents: applicantDocuments,
      visa_documents: visaDocuments
    });
  } catch (error) {
    console.error(
      "Check application error:",
      error
    );

    return jsonResponse(
      {
        error:
          "The application could not be checked at this time."
      },
      500
    );
  }
});
