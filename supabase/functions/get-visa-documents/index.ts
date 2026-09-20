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
      .from("visa_documents")
      .select(
        "id, application_id, title, description, storage_path, file_name, file_type, file_size, is_visible_to_applicant, created_at, updated_at"
      )
      .eq("application_id", applicationId)
      .eq("is_visible_to_applicant", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Visa documents lookup error:",
        error
      );

      return jsonResponse(
        {
          error:
            "Visa documents could not be loaded."
        },
        500
      );
    }

    const documents = await Promise.all(
      (data || []).map(async (document) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabaseAdmin.storage
            .from("visa-documents")
            .createSignedUrl(
              document.storage_path,
              300
            );

        if (signedUrlError) {
          console.error(
            "Visa document signed URL error:",
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
      "Get visa documents error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Visa documents could not be loaded."
      },
      500
    );
  }
});
