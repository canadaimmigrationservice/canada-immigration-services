import { useEffect, useState } from "react";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import {
  createEmailSetting,
  deleteEmailSetting,
  getAdminEmailSettings,
  updateEmailSetting
} from "../../services/adminEmailSettingsService";

function AdminEmailSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    provider: "Gmail",
    is_enabled: true,
    admin_email: "",
    sender_name: "Canada Immigration Services"
  });

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminEmailSettings();
      setSettings(data);
    } catch (loadError) {
      console.error("Unable to load email settings:", loadError);
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

  function resetForm() {
    setEditingId(null);
    setForm({
      provider: "Gmail",
      is_enabled: true,
      admin_email: "",
      sender_name: "Canada Immigration Services"
    });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleEdit(setting) {
    setEditingId(setting.id);

    setForm({
      provider: setting.provider || "Gmail",
      is_enabled: setting.is_enabled !== false,
      admin_email: setting.admin_email || "",
      sender_name:
        setting.sender_name ||
        "Canada Immigration Services"
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const settingData = {
        provider: form.provider,
        is_enabled: form.is_enabled,
        admin_email: form.admin_email,
        sender_name: form.sender_name,
        configuration: {}
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
        await createEmailSetting(settingData);

        setSuccess(
          "Email settings created successfully."
        );
      }

      resetForm();
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

  async function handleDelete(setting) {
    const confirmed = window.confirm(
      `Delete the ${setting.provider} email setting?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteEmailSetting(setting.id);

      if (editingId === setting.id) {
        resetForm();
      }

      setSuccess(
        "Email settings deleted successfully."
      );

      await loadSettings();
    } catch (deleteError) {
      console.error(
        "Unable to delete email settings:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "The email settings could not be deleted."
      );
    }
  }

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Administration</span>
          <h1>Email Settings</h1>
          <p>
            Configure the email provider and notification settings
            used by the immigration services website.
          </p>
        </div>

        <AlertMessage
          type="info"
          title="Secure email connection"
          message="Gmail passwords, OAuth secrets, and other private credentials must not be stored in this frontend configuration. The secure Gmail connection will be configured separately."
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

        <section className="form-card">
          <div className="section-heading">
            <span className="eyebrow">
              {editingId ? "Edit Configuration" : "Configuration"}
            </span>

            <h2>
              {editingId
                ? "Update Email Settings"
                : "Add Email Configuration"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="email-provider">
                Email Provider
              </label>

              <select
                id="email-provider"
                name="provider"
                value={form.provider}
                onChange={handleChange}
                disabled={saving}
                required
              >
                <option value="Gmail">Gmail</option>
              </select>
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
            </div>

            <div className="form-group">
              <label htmlFor="sender-name">
                Sender Name
              </label>

              <input
                id="sender-name"
                name="sender_name"
                type="text"
                value={form.sender_name}
                onChange={handleChange}
                placeholder="Canada Immigration Services"
                disabled={saving}
              />
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="email-enabled">
                <input
                  id="email-enabled"
                  name="is_enabled"
                  type="checkbox"
                  checked={form.is_enabled}
                  onChange={handleChange}
                  disabled={saving}
                />
                Enable email notifications
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
                    ? "Update Email Settings"
                    : "Save Email Settings"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card admin-table-section">
          <div className="section-heading">
            <span className="eyebrow">Saved Configuration</span>
            <h2>Email Providers</h2>
          </div>

          {loading ? (
            <Loading message="Loading email settings..." />
          ) : settings.length === 0 ? (
            <div className="empty-state">
              <h3>No email configuration found</h3>
              <p>
                Add an email configuration using the form above.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Administrator Email</th>
                    <th>Sender Name</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {settings.map((setting) => (
                    <tr key={setting.id}>
                      <td>
                        <strong>
                          {setting.provider}
                        </strong>
                      </td>

                      <td>
                        {setting.admin_email || "—"}
                      </td>

                      <td>
                        {setting.sender_name || "—"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            setting.is_enabled
                              ? "status-approved"
                              : "status-closed"
                          }`}
                        >
                          {setting.is_enabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </td>

                      <td>
                        {setting.updated_at
                          ? new Date(
                              setting.updated_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              handleEdit(setting)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              handleDelete(setting)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminEmailSettingsPage;
