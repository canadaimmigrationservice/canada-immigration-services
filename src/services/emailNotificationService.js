import { supabase } from "../lib/supabase";

export async function sendEmailNotification({
  recipient,
  subject,
  message,
  eventType = "general"
}) {
  const cleanRecipient =
    recipient?.trim();

  const cleanSubject =
    subject?.trim();

  const cleanMessage =
    message?.trim();

  if (!cleanRecipient) {
    throw new Error(
      "Recipient email is required."
    );
  }

  if (!cleanSubject) {
    throw new Error(
      "Email subject is required."
    );
  }

  if (!cleanMessage) {
    throw new Error(
      "Email message is required."
    );
  }

  const { data, error } =
    await supabase.functions.invoke(
      "send-email-notification",
      {
        body: {
          recipient: cleanRecipient,
          subject: cleanSubject,
          message: cleanMessage,
          event_type:
            eventType?.trim() ||
            "general"
        }
      }
    );

  if (error) {
    throw new Error(
      error.message ||
        "The email notification could not be sent."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "The email notification could not be sent."
    );
  }

  return data;
}
