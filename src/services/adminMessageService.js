import { supabase } from "../lib/supabase";

export async function getAdminMessages(filters = {}) {
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
    .order("created_at", { ascending: false });

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.isVisible !== undefined && filters.isVisible !== "") {
    query = query.eq("is_visible", filters.isVisible === true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      error.message || "Application messages could not be loaded."
    );
  }

  return data || [];
}

export async function createApplicationMessage(messageData) {
  if (!messageData?.application_id) {
    throw new Error("Application ID is required.");
  }

  if (!messageData?.message?.trim()) {
    throw new Error("Message content is required.");
  }

  const { data, error } = await supabase
    .from("application_messages")
    .insert({
      application_id: messageData.application_id,
      message: messageData.message.trim(),
      is_visible: messageData.is_visible !== false
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "The application message could not be created."
    );
  }

  return data;
}

export async function updateApplicationMessage(
  messageId,
  updates
) {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Message updates are required.");
  }

  const cleanUpdates = {};

  if (
    Object.prototype.hasOwnProperty.call(updates, "message")
  ) {
    if (!updates.message?.trim()) {
      throw new Error("Message content is required.");
    }

    cleanUpdates.message = updates.message.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "is_visible"
    )
  ) {
    cleanUpdates.is_visible = Boolean(updates.is_visible);
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No message changes were provided.");
  }

  const { data, error } = await supabase
    .from("application_messages")
    .update(cleanUpdates)
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "The application message could not be updated."
    );
  }

  return data;
}

export async function setApplicationMessageVisibility(
  messageId,
  isVisible
) {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  const { data, error } = await supabase
    .from("application_messages")
    .update({
      is_visible: Boolean(isVisible)
    })
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message || "Message visibility could not be updated."
    );
  }

  return data;
}

export async function deleteApplicationMessage(messageId) {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  const { error } = await supabase
    .from("application_messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    throw new Error(
      error.message || "The application message could not be deleted."
    );
  }
}
