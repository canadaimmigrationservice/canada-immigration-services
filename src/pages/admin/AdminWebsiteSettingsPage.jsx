import { useEffect, useState } from "react";
import {
  createWebsiteSetting,
  deleteWebsiteSetting,
  getAdminWebsiteSettings,
  updateWebsiteSetting,
  uploadWebsiteAsset
} from "../../services/adminWebsiteSettingsService";

const DEFAULT_SETTINGS = [
  {
    key: "site_name",
    value: "Canada Immigration Services",
    description: "Website name."
  },
  {
    key: "footer_description",
    value:
      "Visa and immigration application information and support.",
    description: "Footer description."
  },
  {
    key: "footer_copyright",
    value: "All rights reserved.",
    description: "Footer copyright text."
  },
  {
    key: "homepage_hero_title",
    value: "Canada Immigration Services",
    description: "Homepage hero title."
  },
  {
    key: "homepage_hero_description",
    value:
      "Professional information and support for Canadian visa and immigration applications.",
    description: "Homepage hero description."
  },
  {
    key: "homepage_hero_button_text",
    value: "Apply for Visa",
    description: "Homepage hero button text."
  },
  {
    key: "homepage_about_title",
    value: "About Canada Immigration Services",
    description: "Homepage about section title."
  },
  {
    key: "homepage_about_description",
    value:
      "Learn more about our visa and immigration application services.",
    description: "Homepage about section description."
  },
  {
    key: "homepage_process_title",
    value: "How the Process Works",
    description: "Homepage process section title."
  },
  {
    key: "homepage_process_description",
    value:
      "Submit your application, provide the required information and documents, and monitor your application status.",
    description: "Homepage process section description."
  },
  {
    key: "homepage_cta_title",
    value: "Ready to Start Your Application?",
    description: "Homepage call-to-action title."
  },
  {
    key: "homepage_cta_description",
    value:
      "Start your application and provide the information required for processing.",
    description: "Homepage call-to-action description."
  },
  {
    key: "about_title",
    value: "About Us",
    description: "About page title."
  },
  {
    key: "about_description",
    value:
      "Information about Canada Immigration Services.",
    description: "About page description."
  },
  {
    key: "about_mission_title",
    value: "Our Mission",
    description: "About page mission title."
  },
  {
    key: "about_mission_description",
    value:
      "To provide clear information and organized support throughout the application process.",
    description: "About page mission description."
  },
  {
    key: "about_approach_title",
    value: "Our Approach",
    description: "About page approach title."
  },
  {
    key: "about_approach_description",
    value:
      "We organize application information, documents, messages, and status updates in one place.",
    description: "About page approach description."
  },
  {
    key: "visa_services_title",
    value: "Visa Services",
    description: "Visa services page title."
  },
  {
    key: "visa_services_description",
    value:
      "Explore the visa and immigration services available.",
    description: "Visa services page description."
  },
  {
    key: "apply_title",
    value: "Apply for Visa",
    description: "Application page title."
  },
  {
    key: "apply_description",
    value:
      "Complete the application form and provide the required information.",
    description: "Application page description."
  },
  {
    key: "check_application_title",
    value: "Check Your Application",
    description: "Application check page title."
  },
  {
    key: "check_application_description",
    value:
      "Enter your Application Number to check your application information.",
    description: "Application check page description."
  },
  {
    key: "contact_title",
    value: "Contact Us",
    description: "Contact page title."
  },
  {
    key: "contact_description",
    value:
      "Contact Canada Immigration Services for assistance and information.",
    description: "Contact page description."
  },
  {
    key: "contact_email",
    value: "",
    description: "Public contact email address."
  },
  {
    key: "contact_phone",
    value: "",
    description: "Public contact phone number."
  },
  {
    key: "contact_address",
    value: "",
    description: "Public contact address."
  },
  {
    key: "contact_whatsapp",
    value: "",
    description: "Public WhatsApp contact number."
  }
];

function AdminWebsiteSettingsPage() {
  const [settings, setSettings] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    key: "",
    value: "",
    description: ""
  });

  const [editingId, setEditingId] =
    useState(null);

  const [logoFile, setLogoFile] =
    useState(null);
  const [faviconFile, setFaviconFile] =
    useState(null);

  const [logoUploading, setLogoUploading] =
    useState(false);
  const [
    faviconUploading,
    setFaviconUploading
  ] = useState(false);

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getAdminWebsiteSettings();

      setSettings(data || []);
    } catch (loadError) {
      setError(
        loadError.message ||
          "Website settings could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function resetForm() {
    setForm({
      key: "",
      value: "",
      description: ""
    });

    setEditingId(null);
  }

  function startEdit(setting) {
    setEditingId(setting.id);

    setForm({
      key: setting.key || "",
      value: setting.value || "",
      description:
        setting.description || ""
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

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateWebsiteSetting(
          editingId,
          {
            key: form.key,
            value: form.value,
            description:
              form.description
          }
        );

        setSuccess(
          "Website setting updated successfully."
        );
      } else {
        await createWebsiteSetting({
          key: form.key,
          value: form.value,
          description:
            form.description
        });

        setSuccess(
          "Website setting created successfully."
        );
      }

      resetForm();
      await loadSettings();
    } catch (saveError) {
      setError(
        saveError.message ||
          "The website setting could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    setting
  ) {
    const confirmed =
      window.confirm(
        `Delete the "${setting.key}" website setting?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteWebsiteSetting(
        setting.id
      );

      setSuccess(
        "Website setting deleted successfully."
      );

      if (
        editingId === setting.id
      ) {
        resetForm();
      }

      await loadSettings();
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "The website setting could not be deleted."
      );
    }
  }

  async function saveAssetSetting(
    key,
    publicUrl,
    assetType
  ) {
    const existing =
      settings.find(
        (setting) =>
          setting.key === key
      );

    if (existing) {
      await updateWebsiteSetting(
        existing.id,
        {
          value: publicUrl
        }
      );
    } else {
      await createWebsiteSetting({
        key,
        value: publicUrl,
        description:
          assetType === "logo"
            ? "Website logo."
            : "Website favicon."
      });
    }
  }

  async function handleAssetUpload(
    assetType
  ) {
    const file =
      assetType === "logo"
        ? logoFile
        : faviconFile;

    if (!file) {
      setError(
        `Please select a ${assetType} file first.`
      );
      return;
    }

    if (assetType === "logo") {
      setLogoUploading(true);
    } else {
      setFaviconUploading(true);
    }

    setError("");
    setSuccess("");

    try {
      const result =
        await uploadWebsiteAsset({
          assetType,
          file
        });

      await saveAssetSetting(
        assetType === "logo"
          ? "site_logo"
          : "site_favicon",
        result.public_url,
        assetType
      );

      if (assetType === "logo") {
        setLogoFile(null);
      } else {
        setFaviconFile(null);
      }

      setSuccess(
        `${
          assetType === "logo"
            ? "Logo"
            : "Favicon"
        } uploaded successfully.`
      );

      await loadSettings();
    } catch (uploadError) {
      setError(
        uploadError.message ||
          `The ${assetType} could not be uploaded.`
      );
    } finally {
      if (assetType === "logo") {
        setLogoUploading(false);
      } else {
        setFaviconUploading(false);
      }
    }
  }

  function getSettingValue(key) {
    return (
      settings.find(
        (setting) =>
          setting.key === key
      )?.value || ""
    );
  }

  const logoUrl =
    getSettingValue("site_logo");

  const faviconUrl =
    getSettingValue(
      "site_favicon"
    );

  return (
    <main className="page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">
            Administration
          </span>

          <h1>Website Settings</h1>

          <p>
            Manage the public website content,
            contact information, logo, favicon,
            and other configurable settings.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <section className="admin-section">
          <div className="section-heading">
            <h2>Website Branding</h2>

            <p>
              Upload the logo and favicon used
              by the public website.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="website-logo">
                Website Logo
              </label>

              <input
                id="website-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setLogoFile(
                    event.target.files?.[0] ||
                      null
                  )
                }
                disabled={logoUploading}
              />

              {logoFile && (
                <small>
                  Selected:{" "}
                  {logoFile.name}
                </small>
              )}

              {logoUrl && (
                <div className="admin-preview">
                  <img
                    src={logoUrl}
                    alt="Current website logo"
                    style={{
                      maxWidth: "240px",
                      maxHeight: "100px",
                      objectFit: "contain"
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleAssetUpload(
                    "logo"
                  )
                }
                disabled={
                  logoUploading ||
                  !logoFile
                }
              >
                {logoUploading
                  ? "Uploading..."
                  : "Upload Logo"}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="website-favicon">
                Website Favicon
              </label>

              <input
                id="website-favicon"
                type="file"
                accept="image/x-icon,image/png,image/webp"
                onChange={(event) =>
                  setFaviconFile(
                    event.target.files?.[0] ||
                      null
                  )
                }
                disabled={
                  faviconUploading
                }
              />

              {faviconFile && (
                <small>
                  Selected:{" "}
                  {faviconFile.name}
                </small>
              )}

              {faviconUrl && (
                <div className="admin-preview">
                  <img
                    src={faviconUrl}
                    alt="Current website favicon"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain"
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleAssetUpload(
                    "favicon"
                  )
                }
                disabled={
                  faviconUploading ||
                  !faviconFile
                }
              >
                {faviconUploading
                  ? "Uploading..."
                  : "Upload Favicon"}
              </button>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>
              {editingId
                ? "Edit Website Setting"
                : "Add Website Setting"}
            </h2>

            <p>
              Create or update configurable
              website content.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-form"
          >
            <div className="form-group">
              <label htmlFor="setting-key">
                Setting Key
              </label>

              <input
                id="setting-key"
                name="key"
                type="text"
                value={form.key}
                onChange={handleChange}
                placeholder="example_setting"
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setting-value">
                Value
              </label>

              <textarea
                id="setting-value"
                name="value"
                rows="5"
                value={form.value}
                onChange={handleChange}
                placeholder="Enter the setting value"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="setting-description">
                Description
              </label>

              <textarea
                id="setting-description"
                name="description"
                rows="3"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="Describe what this setting controls"
                disabled={saving}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Setting"
                    : "Add Setting"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>Current Website Settings</h2>
          </div>

          {loading ? (
            <p>
              Loading website settings...
            </p>
          ) : settings.length === 0 ? (
            <div className="empty-state">
              <h3>
                No website settings found
              </h3>

              <p>
                Add your first website setting
                above.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {settings.map(
                    (setting) => (
                      <tr
                        key={setting.id}
                      >
                        <td>
                          <strong>
                            {setting.key}
                          </strong>
                        </td>

                        <td>
                          <div
                            style={{
                              maxWidth:
                                "360px",
                              overflowWrap:
                                "anywhere"
                            }}
                          >
                            {setting.value ||
                              "—"}
                          </div>
                        </td>

                        <td>
                          {setting.description ||
                            "—"}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                startEdit(
                                  setting
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() =>
                                handleDelete(
                                  setting
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {settings.length === 0 && (
          <section className="admin-section">
            <div className="section-heading">
              <h2>
                Suggested Settings
              </h2>

              <p>
                These are the settings used by
                the current public pages.
              </p>
            </div>

            <div className="table-actions">
              {DEFAULT_SETTINGS.map(
                (setting) => (
                  <button
                    key={setting.key}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setForm({
                        key: setting.key,
                        value:
                          setting.value,
                        description:
                          setting.description
                      })
                    }
                  >
                    Use{" "}
                    {setting.key}
                  </button>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminWebsiteSettingsPage;
