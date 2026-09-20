import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "").trim();
}

async function verifyAdmin(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Administrator authentication is required.");
  }

  const {
    data: { user },
    error: userError
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Administrator authentication could not be verified.");
  }

  const { data: adminUser, error: adminError } =
    await supabaseAdmin
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

  if (adminError || !adminUser) {
    throw new Error("This account is not authorized to perform this action.");
  }

  return {
    user,
    adminUser
  };
}

function getBucket(bucket: string) {
  if (
    bucket !== "applicant-documents" &&
    bucket !== "visa-documents"
  ) {
    throw new Error("Invalid document bucket.");
  }

  return bucket;
}

async function handleDelete(
  bucket: string,
  storagePath: string
) {
  if (!storagePath?.trim()) {
    throw new Error("Storage path is required.");
  }

  const validBucket = getBucket(bucket);

  const { error } = await supabaseAdmin.storage
    .from(validBucket)
    .remove([storagePath.trim()]);

  if (error) {
    throw new Error(
      error.message || "The document file could not be deleted."
    );
  }

  return {
    success: true
  };
}

async function handleSignedUrl(
  bucket: string,
  storagePath: string,
  expiresIn = 300
) {
  if (!storagePath?.trim()) {
    throw new Error("Storage path is required.");
  }

  const validBucket = getBucket(bucket);

  const safeExpiry = Math.min(
    Math.max(Number(expiresIn) || 300, 60),
    3600
  );

  const { data, error } = await supabaseAdmin.storage
    .from(validBucket)
    .createSignedUrl(
      storagePath.trim(),
      safeExpiry
    );

  if (error || !data?.signedUrl) {
    throw new Error(
      error?.message ||
        "A secure document URL could not be created."
    );
  }

  return {
    success: true,
    signed_url: data.signedUrl,
    expires_in: safeExpiry
  };
}

async function handleUpload(
  bucket: string,
  storagePath: string,
  file: File
) {
  if (!storagePath?.trim()) {
    throw new Error("Storage path is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("A document file is required.");
  }

  const validBucket = getBucket(bucket);

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("The document exceeds the 10 MB size limit.");
  }

  const { error } = await supabaseAdmin.storage
    .from(validBucket)
    .upload(storagePath.trim(), file, {
      contentType: file.type || "application/octet-stream",
      upsert: true
    });

  if (error) {
    throw new Error(
      error.message || "The document file could not be uploaded."
    );
  }

  return {
    success: true,
    storage_path: storagePath.trim(),
    file_name: file.name,
    mime_type: file.type || null,
    file_size: file.size
  };
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
        success: false,
        error: "Only POST requests are allowed."
      },
      405
    );
  }

  try {
    await verifyAdmin(request);

    const contentType =
      request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const action = String(
        formData.get("action") || ""
      );

      const bucket = String(
        formData.get("bucket") || ""
      );

      const storagePath = String(
        formData.get("storage_path") || ""
      );

      if (action !== "upload") {
        return jsonResponse(
          {
            success: false,
            error: "Multipart requests only support document uploads."
          },
          400
        );
      }

      const file = formData.get("file");

      if (!(file instanceof File)) {
        throw new Error("A document file is required.");
      }

      return jsonResponse(
        await handleUpload(
          bucket,
          storagePath,
          file
        )
      );
    }

    const body = await request.json();

    const action = body?.action;
    const bucket = body?.bucket;
    const storagePath = body?.storage_path;

    if (action === "delete") {
      return jsonResponse(
        await handleDelete(
          bucket,
          storagePath
        )
      );
    }

    if (action === "signed-url") {
      return jsonResponse(
        await handleSignedUrl(
          bucket,
          storagePath,
          body?.expires_in
        )
      );
    }

    return jsonResponse(
      {
        success: false,
        error: "Unsupported document action."
      },
      400
    );
  } catch (error) {
    console.error(
      "Admin document action failed:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error?.message ||
          "The administrator document action could not be completed."
      },
      400
    );
  }
});
