import { useEffect, useState } from "react";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import {
  createEmailSetting,
  getAdminEmailSettings,
  updateEmailSetting
} from "../../services/adminEmailSettingsService";

const DEFAULT_FORM = {
  notifications_enabled: true,
  admin_email: "",
  applicant_application_submitted: true,
  applicant_application_number_assigned: true,
  applicant_status_changed: true,
  applicant_document_requested: true,
  applicant_document_received: true,
  applicant_message_received: true,
  applicant_decision_updated: true,
  applicant_passport_instructions: true,
  applicant_visa_document_available: true,
  admin_new_application: true,
  admin_applicant_document_uploaded: true
};

const NOTIFICATION_OPTIONS = [
  {
    key: "applicant_application_submitted",
    label: "Applicant — Application Submitted"
  },
  {
    key: "applicant_application_number_assigned",
    label: "Applicant — Application Number Assigned"
  },
  {
    key: "applicant_status_changed",
    label: "Applicant — Application Status Changed"
  },
  {
    key: "applicant_document_requested",
    label: "Applicant — Additional Document Requested"
  },
  {
    key: "applicant_document_received",
    label: "Applicant — Document Received"
  },
  {
    key: "applicant_message_received",
    label: "Applicant — New Message"
  },
  {
    key: "applicant_decision_updated",
    label: "Applicant — Decision Updated"
  },
  {
    key: "applicant_passport_instructions",
    label: "Applicant — Passport Instructions Updated"
  },
  {
    key: "applicant_visa_document_available",
    label: "Applicant — Visa Document Available"
  },
  {
    key: "admin_new_application",
    label: "Administrator — New Application"
  },
  {
    key: "admin_applicant_document_uploaded",
    label: "Administrator — Applicant Document Uploaded"
  }
];

function AdminEmailSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminEmailSettings();

      setSettings(data);

      if (data.length > 0) {
        const existing = data[0];

        setEditingId(existing.id);

        setForm({
          notifications_enabled:
            existing.notifications_enabled !== false,

          admin_email:
            existing.admin_email || "",

          applicant_application_submitted:
            existing.applicant_application_submitted !== false,

          applicant_application_number_assigned:
            existing.applicant_application_number_assigned !== false,

          applicant_status_changed:
            existing.applicant_status_changed !== false,

          applicant_document_requested:
            existing.applicant_document_requested !== false,

          applicant_document_received:
            existing.applicant_document_received !== false,

          applicant_message_received:
            existing.applicant_message_received !== false,

          applicant_decision_updated:
            existing.applicant_decision_updated !== false,

          applicant_passport_instructions:
            existing.applicant_passport_instructions !== false,

          applicant_visa_document_available:
            existing.applicant_visa_document_available !== false,

          admin_new_application:
            existing.admin_new_application !== false,

          admin_applicant_document_uploaded:
            existing.admin_applicant_document_uploaded !== false
        });
      } else {
        setEditingId(null);
        setForm(DEFAULT_FORM);
      }
    } catch (loadError) {
      console.error(
        "Unable to load email settings:",
        loadError
      );

      setError(
        loadError?.message ||
          "Email settings could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const settingData = {
        ...form,
        admin_email:
          form.admin_email.trim() || null
      };

      if (editingId) {
        await updateEmailSetting(
          editingId,
          settingData
        );

        setSuccess(
          "Email settings updated successfully."
        );
      } else {
        const created =
          await createEmailSetting(
            settingData
          );

        setEditingId(created.id);

        setSuccess(
          "Email settings created successfully."
        );
      }

      await loadSettings();
    } catch (saveError) {
      console.error(
        "Unable to save email settings:",
        saveError
      );

      setError(
        saveError?.message ||
          "The email settings could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  function enableAllNotifications() {
    setForm((current) => {
      const updated = {
        ...current
      };

      for (const option of NOTIFICATION_OPTIONS) {
        updated[option.key] = true;
      }

      return updated;
    });
  }

  function disableAllNotifications() {
    setForm((current) => {
      const updated = {
        ...current
      };

      for (const option of NOTIFICATION_OPTIONS) {
        updated[option.key] = false;
      }

      return updated;
    });
  }

  const savedSettings = settings[0];

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">
            Administration
          </span>

          <h1>Email Settings</h1>

          <p>
            Control email notifications for applicants
            and administrators.
          </p>
        </div>

        <AlertMessage
          type="info"
          title="Secure email connection"
          message="Gmail authentication is handled securely through the email notification service. Gmail passwords and OAuth secrets must never be stored in this frontend configuration."
        />

        {error && (
          <AlertMessage
            type="error"
            title="Email settings error"
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

        {loading ? (
          <Loading message="Loading email settings..." />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="form-grid"
          >
            <section className="form-card full-width">
              <div className="section-heading">
                <span className="eyebrow">
                  General
                </span>

                <h2>
                  Email Notification Settings
                </h2>

                <p>
                  Configure the administrator email
                  address and enable or disable email
                  notifications.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="admin-email">
                  Administrator Email
                </label>

                <input
                  id="admin-email"
                  name="admin_email"
                  type="email"
                  value={form.admin_email}
                  onChange={handleChange}
                  placeholder="Enter administrator email"
                  autoComplete="email"
                  disabled={saving}
                />

                <small>
                  Administrator notifications will be
                  sent to this email address.
                </small>
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="notifications-enabled">
                  <input
                    id="notifications-enabled"
                    name="notifications_enabled"
                    type="checkbox"
                    checked={
                      form.notifications_enabled
                    }
                    onChange={handleChange}
                    disabled={saving}
                  />

                  Enable email notifications
                </label>
              </div>
            </section>

            <section className="form-card full-width">
              <div className="section-heading">
                <span className="eyebrow">
                  Applicant Notifications
                </span>

                <h2>
                  Applicant Email Events
                </h2>

                <p>
                  Choose which events should send
                  notifications to applicants.
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={enableAllNotifications}
                  disabled={saving}
                >
                  Enable All
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={disableAllNotifications}
                  disabled={saving}
                >
                  Disable All
                </button>
              </div>

              <div className="form-grid">
                {NOTIFICATION_OPTIONS.map(
                  (option) => (
                    <div
                      className="form-group checkbox-group"
                      key={option.key}
                    >
                      <label
                        htmlFor={option.key}
                      >
                        <input
                          id={option.key}
                          name={option.key}
                          type="checkbox"
                          checked={
                            form[option.key]
                          }
                          onChange={handleChange}
                          disabled={
                            saving ||
                            !form.notifications_enabled
                          }
                        />

                        {option.label}
                      </label>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="form-card full-width">
              <div className="section-heading">
                <span className="eyebrow">
                  Current Configuration
                </span>

                <h2>
                  Email Service
                </h2>

                <p>
                  The website uses the secure Gmail
                  notification service configured
                  through the backend.
                </p>
              </div>

              <div className="form-group">
                <label>
                  Email Provider
                </label>

                <input
                  type="text"
                  value="Gmail"
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>
                  Notification Status
                </label>

                <input
                  type="text"
                  value={
                    form.notifications_enabled
                      ? "Enabled"
                      : "Disabled"
                  }
                  disabled
                  readOnly
                />
              </div>
            </section>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Email Settings"
                    : "Save Email Settings"}
              </button>
            </div>
          </form>
        )}

        {!loading && savedSettings && (
          <section className="card admin-table-section">
            <div className="section-heading">
              <span className="eyebrow">
                Configuration Status
              </span>

              <h2>
                Saved Email Settings
              </h2>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      Administrator Email
                    </th>

                    <th>
                      Notifications
                    </th>

                    <th>
                      Applicant Events
                    </th>

                    <th>
                      Admin Events
                    </th>

                    <th>
                      Updated
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      {savedSettings.admin_email ||
                        "Not configured"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          savedSettings.notifications_enabled
                            ? "status-approved"
                            : "status-closed"
                        }`}
                      >
                        {savedSettings.notifications_enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </td>

                    <td>
                      {
                        NOTIFICATION_OPTIONS.filter(
                          (option) =>
                            option.key.startsWith(
                              "applicant_"
                            ) &&
                            savedSettings[
                              option.key
                            ]
                        ).length
                      } enabled
                    </td>

                    <td>
                      {
                        NOTIFICATION_OPTIONS.filter(
                          (option) =>
                            option.key.startsWith(
                              "admin_"
                            ) &&
                            savedSettings[
                              option.key
                            ]
                        ).length
                      } enabled
                    </td>

                    <td>
                      {savedSettings.updated_at
                        ? new Date(
                            savedSettings.updated_at
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminEmailSettingsPage;
