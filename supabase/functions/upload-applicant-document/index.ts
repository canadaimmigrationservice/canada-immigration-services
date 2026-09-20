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

    const formData = await request.formData();

    const applicationId = cleanString(
      formData.get("application_id")
    );

    const file = formData.get("file");

    if (!applicationId) {
      return jsonResponse(
        {
          error: "Application ID is required."
        },
        400
      );
    }

    if (!(file instanceof File)) {
      return jsonResponse(
        {
          error: "A document file is required."
        },
        400
      );
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return jsonResponse(
        {
          error: "The selected file is too large. Maximum size is 10 MB."
        },
        400
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return jsonResponse(
        {
          error: "This file type is not supported."
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
        .select("id")
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
      console.error(
        "Application verification error:",
        applicationError
      );

      return jsonResponse(
        {
          error: "The application could not be verified."
        },
        500
      );
    }

    if (!application) {
      return jsonResponse(
        {
          error: "The application could not be found."
        },
        404
      );
    }

    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const filePath = `${applicationId}/${crypto.randomUUID()}-${safeFileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("applicant-documents")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error(
        "Document storage error:",
        uploadError
      );

      return jsonResponse(
        {
          error: "The document could not be uploaded."
        },
        500
      );
    }

    const { data: document, error: documentError } =
      await supabaseAdmin
        .from("applicant_documents")
        .insert({
          application_id: applicationId,
          file_name: file.name,
          storage_path: filePath,
          file_type: file.type,
          file_size: file.size
        })
        .select(
          "id, application_id, file_name, storage_path, file_type, file_size, uploaded_at"
        )
        .single();

    if (documentError) {
      await supabaseAdmin.storage
        .from("applicant-documents")
        .remove([filePath]);

      console.error(
        "Document database error:",
        documentError
      );

      return jsonResponse(
        {
          error: "The document could not be registered."
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      document
    });
  } catch (error) {
    console.error(
      "Upload applicant document error:",
      error
    );

    return jsonResponse(
      {
        error: "The document could not be processed."
      },
      500
    );
  }
});
