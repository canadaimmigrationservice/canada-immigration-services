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
  throw new Error(
    "Supabase environment variables are not configured."
  );
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
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

function getBearerToken(request: Request) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization
    .replace("Bearer ", "")
    .trim();
}

async function verifyRequest(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error(
      "Authentication is required."
    );
  }

  if (token === serviceRoleKey) {
    return {
      type: "service",
      role: "service_role"
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    throw new Error(
      "Authentication could not be verified."
    );
  }

  const {
    data: adminUser,
    error: adminError
  } = await supabaseAdmin
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !adminUser) {
    throw new Error(
      "This account is not authorized to send email notifications."
    );
  }

  return {
    type: "admin",
    role: adminUser.role,
    userId: user.id
  };
}

async function getEmailSettings() {
  const { data, error } = await supabaseAdmin
    .from("email_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        "Email settings could not be loaded."
    );
  }

  return data;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createHtml(
  subject: string,
  message: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${escapeHtml(subject)}</title>
</head>
<body
  style="
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 640px;
      margin: 0 auto;
      padding: 32px 20px;
    "
  >
    <div
      style="
        background: #ffffff;
        padding: 32px;
        border-radius: 8px;
      "
    >
      <h1
        style="
          margin-top: 0;
          font-size: 24px;
        "
      >
        ${escapeHtml(subject)}
      </h1>

      <div
        style="
          font-size: 16px;
          line-height: 1.7;
        "
      >
        ${escapeHtml(message).replace(
          /\n/g,
          "<br />"
        )}
      </div>

      <hr
        style="
          margin: 30px 0;
          border: 0;
          border-top: 1px solid #ddd;
        "
      />

      <p
        style="
          margin-bottom: 0;
          color: #666;
          font-size: 14px;
        "
      >
        Canada Immigration Services
      </p>
    </div>
  </div>
</body>
</html>
`;
}

function base64UrlEncode(value: string) {
  const bytes =
    new TextEncoder().encode(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createRawEmail({
  from,
  to,
  subject,
  message
}: {
  from: string;
  to: string;
  subject: string;
  message: string;
}) {
  const html = createHtml(
    subject,
    message
  );

  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html
  ].join("\r\n");

  return base64UrlEncode(raw);
}

async function refreshAccessToken(
  refreshToken: string
) {
  const clientId =
    Deno.env.get(
      "GOOGLE_CLIENT_ID"
    );

  const clientSecret =
    Deno.env.get(
      "GOOGLE_CLIENT_SECRET"
    );

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth credentials are not configured."
    );
  }

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        "Google access token refresh failed."
    );
  }

  return data.access_token;
}

async function sendGmailMessage({
  accessToken,
  from,
  to,
  subject,
  message
}: {
  accessToken: string;
  from: string;
  to: string;
  subject: string;
  message: string;
}) {
  const raw = createRawEmail({
    from,
    to,
    subject,
    message
  });

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        raw
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Gmail could not send the message."
    );
  }

  return data;
}

async function logEmail({
  recipient,
  subject,
  eventType,
  status,
  errorMessage = null
}: {
  recipient: string;
  subject: string;
  eventType: string;
  status: string;
  errorMessage?: string | null;
}) {
  const { error } =
    await supabaseAdmin
      .from("email_logs")
      .insert({
        recipient_email: recipient,
        email_type: eventType,
        sent_at:
          status === "sent"
            ? new Date().toISOString()
            : null,
        status,
        error_message:
          errorMessage
      });

  if (error) {
    console.error(
      "Email log could not be saved:",
      error
    );
  }
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
        error:
          "Only POST requests are allowed."
      },
      405
    );
  }

  try {
    await verifyRequest(request);

    const body = await request.json();

    const recipient =
      String(
        body.recipient || ""
      ).trim();

    const subject =
      String(
        body.subject || ""
      ).trim();

    const message =
      String(
        body.message || ""
      ).trim();

    const eventType =
      String(
        body.event_type ||
          "general"
      ).trim();

    if (!recipient) {
      throw new Error(
        "Recipient email is required."
      );
    }

    if (!subject) {
      throw new Error(
        "Email subject is required."
      );
    }

    if (!message) {
      throw new Error(
        "Email message is required."
      );
    }

    const settings =
      await getEmailSettings();

    if (!settings) {
      throw new Error(
        "Email settings have not been configured."
      );
    }

    if (
      settings.notifications_enabled ===
      false
    ) {
      return jsonResponse({
        success: true,
        skipped: true,
        message:
          "Email notifications are disabled."
      });
    }

    const refreshToken =
      Deno.env.get(
        "GMAIL_REFRESH_TOKEN"
      );

    if (!refreshToken) {
      throw new Error(
        "Gmail OAuth connection has not been configured."
      );
    }

    const accessToken =
      await refreshAccessToken(
        refreshToken
      );

    const fromEmail =
      String(
        settings.admin_email ||
          ""
      ).trim();

    if (!fromEmail) {
      throw new Error(
        "The administrator Gmail address has not been configured."
      );
    }

    try {
      const result =
        await sendGmailMessage({
          accessToken,
          from: fromEmail,
          to: recipient,
          subject,
          message
        });

      await logEmail({
        recipient,
        subject,
        eventType,
        status: "sent"
      });

      return jsonResponse({
        success: true,
        message_id:
          result?.id || null
      });
    } catch (sendError) {
      await logEmail({
        recipient,
        subject,
        eventType,
        status: "failed",
        errorMessage:
          sendError?.message ||
          "Gmail delivery failed."
      });

      throw sendError;
    }
  } catch (error) {
    console.error(
      "Email notification failed:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error?.message ||
          "The email notification could not be sent."
      },
      400
    );
  }
});
