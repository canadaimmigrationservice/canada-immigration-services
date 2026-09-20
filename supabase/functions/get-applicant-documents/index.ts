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

    const applicationId = cleanString(
      body?.application_id
    );

    if (!applicationId) {
      return jsonResponse(
        {
          error: "Application ID is required."
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

    const { data, error } = await supabaseAdmin
      .from("applicant_documents")
      .select(
        "id, application_id, file_name, storage_path, file_type, file_size, uploaded_at"
      )
      .eq("application_id", applicationId)
      .order("uploaded_at", { ascending: true });

    if (error) {
      console.error(
        "Applicant documents lookup error:",
        error
      );

      return jsonResponse(
        {
          error:
            "Applicant documents could not be loaded."
        },
        500
      );
    }

    const documents = await Promise.all(
      (data || []).map(async (document) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabaseAdmin.storage
            .from("applicant-documents")
            .createSignedUrl(
              document.storage_path,
              300
            );

        if (signedUrlError) {
          console.error(
            "Signed URL error:",
            signedUrlError
          );
        }

        return {
          ...document,
          signed_url:
            signedUrlData?.signedUrl || null
        };
      })
    );

    return jsonResponse({
      success: true,
      documents
    });
  } catch (error) {
    console.error(
      "Get applicant documents error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Applicant documents could not be loaded."
      },
      500
    );
  }
});
