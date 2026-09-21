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

function response(
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

async function getEmailSettings() {
  const { data, error } =
    await supabaseAdmin
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
  await supabaseAdmin
    .from("email_logs")
    .insert({
      recipient,
      subject,
      event_type: eventType,
      status,
      error_message: errorMessage
    });
}

function buildHtml(
  title: string,
  message: string
) {
  const safeTitle = title
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
          <h1>${safeTitle}</h1>
          <p>${safeMessage}</p>
          <p>
            Canada Immigration Services
          </p>
        </div>
      </body>
    </html>
  `;
}

async function sendWithResend(
  settings: Record<string, unknown>,
  recipient: string,
  subject: string,
  message: string
) {
  const apiKey =
    Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    throw new Error(
      "Email provider credentials are not configured."
    );
  }

  const fromEmail =
    String(
      settings.from_email ||
        settings.admin_email ||
        "onboarding@resend.dev"
    );

  const result = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${apiKey}`,
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient],
        subject,
        html: buildHtml(
          subject,
          message
        )
      })
    }
  );

  if (!result.ok) {
    const errorText =
      await result.text();

    throw new Error(
      errorText ||
        "The email provider rejected the message."
    );
  }

  return await result.json();
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
      return response(
        {
          success: false,
          error:
            "Only POST requests are allowed."
        },
        405
      );
    }

    try {
      const body =
        await request.json();

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
        settings.is_enabled === false
      ) {
        return response({
          success: true,
          skipped: true,
          message:
            "Email notifications are disabled."
        });
      }

      try {
        const result =
          await sendWithResend(
            settings,
            recipient,
            subject,
            message
          );

        await logEmail({
          recipient,
          subject,
          eventType,
          status: "sent"
        });

        return response({
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
            "Email delivery failed."
        });

        throw sendError;
      }
    } catch (error) {
      console.error(
        "Email notification failed:",
        error
      );

      return response(
        {
          success: false,
          error:
            error?.message ||
            "The email notification could not be sent."
        },
        400
      );
    }
  }
);
