import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import {
  getAdminMessages,
  createApplicationMessage,
  updateApplicationMessage,
  setApplicationMessageVisibility,
  deleteApplicationMessage
} from "../../services/adminMessageService";
import { formatDateTime } from "../../lib/formatters";

const emptyForm = {
  application_id: "",
  message: "",
  is_visible: true
};

function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMessages() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminMessages();
      setMessages(data);
    } catch (requestError) {
      console.error(
        "Unable to load application messages:",
        requestError
      );

      setError(
        requestError?.message ||
          "Application messages could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  function startEdit(message) {
    setEditingId(message.id);

    setForm({
      application_id: message.application_id || "",
      message: message.message || "",
      is_visible: message.is_visible !== false
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateApplicationMessage(editingId, {
          message: form.message,
          is_visible: form.is_visible
        });

        setSuccess("Application message updated successfully.");
      } else {
        await createApplicationMessage(form);

        setSuccess("Application message created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadMessages();
    } catch (requestError) {
      console.error(
        "Unable to save application message:",
        requestError
      );

      setError(
        requestError?.message ||
          "The application message could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleVisibilityToggle(message) {
    setError("");
    setSuccess("");

    try {
      await setApplicationMessageVisibility(
        message.id,
        !message.is_visible
      );

      setSuccess(
        message.is_visible
          ? "Message is now hidden from the applicant."
          : "Message is now visible to the applicant."
      );

      await loadMessages();
    } catch (requestError) {
      console.error(
        "Unable to update message visibility:",
        requestError
      );

      setError(
        requestError?.message ||
          "Message visibility could not be updated."
      );
    }
  }

  async function handleDelete(message) {
    const confirmed = window.confirm(
      "Delete this application message? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(message.id);
    setError("");
    setSuccess("");

    try {
      await deleteApplicationMessage(message.id);

      if (editingId === message.id) {
        cancelEdit();
      }

      setSuccess("Application message deleted successfully.");

      await loadMessages();
    } catch (requestError) {
      console.error(
        "Unable to delete application message:",
        requestError
      );

      setError(
        requestError?.message ||
          "The application message could not be deleted."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Messages</h1>
          <p>
            Create and manage messages that are displayed to
            applicants through their application status page.
          </p>
        </div>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Message Management Error"
          message={error}
        />
      )}

      {success && (
        <AlertMessage
          type="success"
          title="Success"
          message={success}
        />
      )}

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">
            {editingId ? "Edit Message" : "New Message"}
          </span>

          <h2>
            {editingId
              ? "Edit Application Message"
              : "Create Application Message"}
          </h2>

          <p>
            Messages can be made visible or hidden from the
            applicant.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="message-application-id">
              Application ID
            </label>

            <input
              id="message-application-id"
              name="application_id"
              type="text"
              value={form.application_id}
              onChange={handleChange}
              placeholder="Enter the application ID"
              disabled={saving || Boolean(editingId)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="application-message">
              Message
            </label>

            <textarea
              id="application-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Enter the message for the applicant."
              rows="6"
              disabled={saving}
              required
            />
          </div>

          <div className="form-group full-width">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_visible"
                checked={form.is_visible}
                onChange={handleChange}
                disabled={saving}
              />

              <span>
                Make this message visible to the applicant
              </span>
            </label>
          </div>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Message"
                : "Create Message"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}

            {!editingId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={startCreate}
                disabled={saving}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Application Communication</span>
          <h2>Applicant Messages</h2>
          <p>
            Review messages associated with applications.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading application messages..." />
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <h2>No Messages</h2>
            <p>
              No application messages have been created yet.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Application Number</th>
                  <th>Message</th>
                  <th>Visibility</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => {
                  const application =
                    message.applications;

                  return (
                    <tr key={message.id}>
                      <td>
                        {application
                          ? `${application.full_name || ""} ${
                              application.surname || ""
                            }`.trim()
                          : "—"}
                      </td>

                      <td>
                        {application?.application_number ||
                          "Not Assigned"}
                      </td>

                      <td className="message-table-cell">
                        {message.message || "—"}
                      </td>

                      <td>
                        <span
                          className={
                            message.is_visible
                              ? "status-badge status-approved"
                              : "status-badge status-closed"
                          }
                        >
                          {message.is_visible
                            ? "Visible"
                            : "Hidden"}
                        </span>
                      </td>

                      <td>
                        {message.created_at
                          ? formatDateTime(
                              message.created_at
                            )
                          : "—"}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-small btn-outline"
                            onClick={() =>
                              startEdit(message)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-small btn-outline"
                            onClick={() =>
                              handleVisibilityToggle(
                                message
                              )
                            }
                          >
                            {message.is_visible
                              ? "Hide"
                              : "Show"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() =>
                              handleDelete(message)
                            }
                            disabled={
                              deletingId === message.id
                            }
                          >
                            {deletingId === message.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminMessagesPage;
