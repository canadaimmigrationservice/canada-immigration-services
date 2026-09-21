import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const serviceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase environment variables are not configured."
  );
}

const supabaseAdmin =
  createClient(
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
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json"
      }
    }
  );
}

function getBearerToken(
  request: Request
) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  return authorization
    .replace("Bearer ", "")
    .trim();
}

async function verifyAdmin(
  request: Request
) {
  const token =
    getBearerToken(request);

  if (!token) {
    throw new Error(
      "Administrator authentication is required."
    );
  }

  const {
    data: { user },
    error: userError
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (userError || !user) {
    throw new Error(
      "Administrator authentication could not be verified."
    );
  }

  const {
    data: adminUser,
    error: adminError
  } =
    await supabaseAdmin
      .from("admin_users")
      .select(
        "id, role, is_active"
      )
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

  if (
    adminError ||
    !adminUser
  ) {
    throw new Error(
      "This account is not authorized to perform this action."
    );
  }

  return adminUser;
}

function validateAsset(
  file: File
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon"
  ];

  const maxSize =
    5 * 1024 * 1024;

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Only JPG, PNG, WebP, or ICO image files are allowed."
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      "The website asset exceeds the 5 MB size limit."
    );
  }
}

function getFileExtension(
  fileName: string,
  mimeType: string
) {
  const existingExtension =
    fileName.includes(".")
      ? fileName
          .split(".")
          .pop()
          ?.toLowerCase()
      : "";

  if (existingExtension) {
    return existingExtension;
  }

  if (
    mimeType ===
    "image/jpeg"
  ) {
    return "jpg";
  }

  if (
    mimeType ===
    "image/png"
  ) {
    return "png";
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    return "webp";
  }

  return "ico";
}

async function uploadAsset(
  assetType: string,
  file: File
) {
  if (
    assetType !== "logo" &&
    assetType !== "favicon"
  ) {
    throw new Error(
      "Invalid website asset type."
    );
  }

  validateAsset(file);

  const extension =
    getFileExtension(
      file.name,
      file.type
    );

  const storagePath =
    `${assetType}/${assetType}-${Date.now()}.${extension}`;

  const {
    error: uploadError
  } =
    await supabaseAdmin.storage
      .from("website-assets")
      .upload(
        storagePath,
        file,
        {
          contentType:
            file.type,
          upsert: false
        }
      );

  if (uploadError) {
    throw new Error(
      uploadError.message ||
        "The website asset could not be uploaded."
    );
  }

  const {
    data: publicUrlData
  } =
    supabaseAdmin.storage
      .from("website-assets")
      .getPublicUrl(
        storagePath
      );

  return {
    success: true,
    asset_type: assetType,
    storage_path:
      storagePath,
    public_url:
      publicUrlData.publicUrl,
    file_name:
      file.name,
    mime_type:
      file.type,
    file_size:
      file.size
  };
}

Deno.serve(
  async (request) => {
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders
        }
      );
    }

    if (
      request.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Only POST requests are allowed."
        },
        405
      );
    }

    try {
      await verifyAdmin(
        request
      );

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "multipart/form-data"
        )
      ) {
        return jsonResponse(
          {
            success: false,
            error:
              "A multipart form upload is required."
          },
          400
        );
      }

      const formData =
        await request.formData();

      const assetType =
        String(
          formData.get(
            "asset_type"
          ) || ""
        );

      const file =
        formData.get("file");

      if (
        !(file instanceof File)
      ) {
        throw new Error(
          "A website asset file is required."
        );
      }

      return jsonResponse(
        await uploadAsset(
          assetType,
          file
        )
      );
    } catch (error) {
      console.error(
        "Website asset action failed:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            error?.message ||
            "The website asset could not be uploaded."
        },
        400
      );
    }
  }
);
