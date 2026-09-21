import { supabase } from "../lib/supabase";
import { sendEmailNotification } from "./emailNotificationService";

export async function getAdminMessages(
  filters = {}
) {
  let query = supabase
    .from("application_messages")
    .select(`
      *,
      applications (
        id,
        application_number,
        full_name,
        surname,
        email
      )
    `)
    .order("created_at", {
      ascending: false
    });

  if (filters.applicationId) {
    query = query.eq(
      "application_id",
      filters.applicationId
    );
  }

  if (
    filters.isVisible !== undefined &&
    filters.isVisible !== ""
  ) {
    query = query.eq(
      "is_visible",
      filters.isVisible === true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throw new Error(
      error.message ||
        "Application messages could not be loaded."
    );
  }

  return data || [];
}

export async function createApplicationMessage(
  messageData
) {
  if (!messageData?.application_id) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (!messageData?.message?.trim()) {
    throw new Error(
      "Message content is required."
    );
  }

  const { data, error } =
    await supabase
      .from("application_messages")
      .insert({
        application_id:
          messageData.application_id,
        message:
          messageData.message.trim(),
        is_visible:
          messageData.is_visible !== false
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "The application message could not be created."
    );
  }

  if (
    data.is_visible &&
    messageData.send_email !== false
  ) {
    try {
      const { data: application } =
        await supabase
          .from("applications")
          .select(
            "id, application_number, full_name, email"
          )
          .eq(
            "id",
            messageData.application_id
          )
          .maybeSingle();

      if (
        application?.email
      ) {
        await sendEmailNotification({
          recipient:
            application.email,
          subject:
            "New Message About Your Application",
          message:
            `Dear ${
              application.full_name ||
              "Applicant"
            },\n\n` +
            `A new message has been added to your application.\n\n` +
            `Message:\n${data.message}\n\n` +
            `Application Number: ${
              application.application_number ||
              "Not yet assigned"
            }\n\n` +
            `Please check your application for the latest information.\n\n` +
            `Canada Immigration Services`,
          eventType:
            "application_message_created"
        });
      }
    } catch (emailError) {
      console.error(
        "Application message email notification failed:",
        emailError
      );
    }
  }

  return data;
}

export async function updateApplicationMessage(
  messageId,
  updates
) {
  if (!messageId) {
    throw new Error(
      "Message ID is required."
    );
  }

  if (
    !updates ||
    typeof updates !== "object"
  ) {
    throw new Error(
      "Message updates are required."
    );
  }

  const cleanUpdates = {};

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "message"
    )
  ) {
    if (!updates.message?.trim()) {
      throw new Error(
        "Message content is required."
      );
    }

    cleanUpdates.message =
      updates.message.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "is_visible"
    )
  ) {
    cleanUpdates.is_visible =
      Boolean(updates.is_visible);
  }

  if (
    Object.keys(cleanUpdates).length === 0
  ) {
    throw new Error(
      "No message changes were provided."
    );
  }

  const { data, error } =
    await supabase
      .from("application_messages")
      .update(cleanUpdates)
      .eq("id", messageId)
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "The application message could not be updated."
    );
  }

  return data;
}

export async function setApplicationMessageVisibility(
  messageId,
  isVisible
) {
  if (!messageId) {
    throw new Error(
      "Message ID is required."
    );
  }

  const { data, error } =
    await supabase
      .from("application_messages")
      .update({
        is_visible:
          Boolean(isVisible)
      })
      .eq("id", messageId)
      .select("*")
      .single();

  if (error) {
    throw new Error(
      error.message ||
        "Message visibility could not be updated."
    );
  }

  return data;
}

export async function deleteApplicationMessage(
  messageId
) {
  if (!messageId) {
    throw new Error(
      "Message ID is required."
    );
  }

  const { error } =
    await supabase
      .from("application_messages")
      .delete()
      .eq("id", messageId);

  if (error) {
    throw new Error(
      error.message ||
        "The application message could not be deleted."
    );
  }
}
