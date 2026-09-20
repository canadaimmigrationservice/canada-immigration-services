import { useEffect, useState } from "react";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import {
  createWebsiteSetting,
  deleteWebsiteSetting,
  getAdminWebsiteSettings,
  updateWebsiteSetting
} from "../../services/adminWebsiteSettingsService";

function AdminWebsiteSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    key: "",
    value: "",
    description: ""
  });

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminWebsiteSettings();
      setSettings(data);
    } catch (loadError) {
      console.error("Unable to load website settings:", loadError);
      setError(
        loadError?.message ||
          "Website settings could not be loaded."
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
      key: "",
      value: "",
      description: ""
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleEdit(setting) {
    setEditingId(setting.id);
    setForm({
      key: setting.key || "",
      value:
        typeof setting.value === "string"
          ? setting.value
          : setting.value
            ? JSON.stringify(setting.value, null, 2)
            : "",
      description: setting.description || ""
    });

    setSuccess("");
    setError("");
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
      if (editingId) {
        await updateWebsiteSetting(editingId, {
          key: form.key,
          value: form.value,
          description: form.description
        });

        setSuccess("Website setting updated successfully.");
      } else {
        await createWebsiteSetting({
          key: form.key,
          value: form.value,
          description: form.description
        });

        setSuccess("Website setting created successfully.");
      }

      resetForm();
      await loadSettings();
    } catch (saveError) {
      console.error("Unable to save website setting:", saveError);
      setError(
        saveError?.message ||
          "The website setting could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(setting) {
    const confirmed = window.confirm(
      `Delete the "${setting.key}" website setting?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteWebsiteSetting(setting.id);

      if (editingId === setting.id) {
        resetForm();
      }

      setSuccess("Website setting deleted successfully.");
      await loadSettings();
    } catch (deleteError) {
      console.error(
        "Unable to delete website setting:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "The website setting could not be deleted."
      );
    }
  }

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Administration</span>
          <h1>Website Settings</h1>
          <p>
            Manage configurable website content and settings from the
            administration area.
          </p>
        </div>

        {error && (
          <AlertMessage
            type="error"
            title="Settings error"
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
              {editingId ? "Edit Setting" : "Add Setting"}
            </span>
            <h2>
              {editingId
                ? "Update Website Setting"
                : "Create Website Setting"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="website-setting-key">
                Setting Key
              </label>
              <input
                id="website-setting-key"
                name="key"
                type="text"
                value={form.key}
                onChange={handleChange}
                placeholder="example: homepage_hero_title"
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="website-setting-description">
                Description
              </label>
              <input
                id="website-setting-description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what this setting controls"
                disabled={saving}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="website-setting-value">
                Value
              </label>
              <textarea
                id="website-setting-value"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="Enter the setting value"
                rows="6"
                disabled={saving}
                required
              />
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
                    ? "Update Setting"
                    : "Create Setting"}
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
            <span className="eyebrow">Current Settings</span>
            <h2>Website Configuration</h2>
          </div>

          {loading ? (
            <Loading message="Loading website settings..." />
          ) : settings.length === 0 ? (
            <div className="empty-state">
              <h3>No website settings found</h3>
              <p>
                Create your first website setting using the form above.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {settings.map((setting) => (
                    <tr key={setting.id}>
                      <td>
                        <strong>{setting.key}</strong>
                      </td>

                      <td>
                        <div className="admin-setting-value">
                          {typeof setting.value === "string"
                            ? setting.value
                            : JSON.stringify(setting.value)}
                        </div>
                      </td>

                      <td>
                        {setting.description || "—"}
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
                            onClick={() => handleEdit(setting)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(setting)}
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

export default AdminWebsiteSettingsPage;
