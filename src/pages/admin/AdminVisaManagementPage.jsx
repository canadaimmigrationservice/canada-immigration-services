import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import {
  getAdminVisaServices,
  createVisaService,
  updateVisaService,
  deleteVisaService,
  setVisaServiceActive
} from "../../services/adminVisaService";

const emptyForm = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  requirements: "",
  processing_time: "",
  display_order: 0,
  is_active: true
};

function AdminVisaManagementPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadServices() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminVisaServices();
      setServices(data);
    } catch (requestError) {
      console.error("Unable to load visa services:", requestError);
      setError(
        requestError?.message ||
          "Visa services could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
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

  function startEdit(service) {
    setEditingId(service.id);

    setForm({
      name: service.name || "",
      slug: service.slug || "",
      short_description: service.short_description || "",
      description: service.description || "",
      requirements: service.requirements || "",
      processing_time: service.processing_time || "",
      display_order: service.display_order ?? 0,
      is_active: service.is_active !== false
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
        await updateVisaService(editingId, form);
        setSuccess("Visa service updated successfully.");
      } else {
        await createVisaService(form);
        setSuccess("Visa service created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadServices();
    } catch (requestError) {
      console.error("Unable to save visa service:", requestError);
      setError(
        requestError?.message ||
          "The visa service could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(service) {
    setError("");
    setSuccess("");

    try {
      await setVisaServiceActive(service.id, !service.is_active);

      setSuccess(
        service.is_active
          ? "Visa service has been deactivated."
          : "Visa service has been activated."
      );

      await loadServices();
    } catch (requestError) {
      console.error(
        "Unable to change visa service status:",
        requestError
      );

      setError(
        requestError?.message ||
          "The visa service status could not be changed."
      );
    }
  }

  async function handleDelete(service) {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteVisaService(service.id);

      if (editingId === service.id) {
        cancelEdit();
      }

      setSuccess("Visa service deleted successfully.");
      await loadServices();
    } catch (requestError) {
      console.error("Unable to delete visa service:", requestError);

      setError(
        requestError?.message ||
          "The visa service could not be deleted."
      );
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Visa Management</h1>
          <p>
            Create, edit, activate, deactivate, and remove the visa
            services displayed on the public website.
          </p>
        </div>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Visa Management Error"
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
            {editingId ? "Edit Service" : "Add Service"}
          </span>

          <h2>
            {editingId
              ? "Edit Visa Service"
              : "Create Visa Service"}
          </h2>

          <p>
            These details can be displayed on the public Visa
            Services pages.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="visa-service-name">
              Service Name
            </label>

            <input
              id="visa-service-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Visitor Visa"
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-service-slug">
              URL Slug
            </label>

            <input
              id="visa-service-slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. visitor-visa"
              disabled={saving}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visa-service-short-description">
              Short Description
            </label>

            <textarea
              id="visa-service-short-description"
              name="short_description"
              value={form.short_description}
              onChange={handleChange}
              placeholder="Brief description shown in service listings."
              rows="3"
              disabled={saving}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visa-service-description">
              Full Description
            </label>

            <textarea
              id="visa-service-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description of this visa service."
              rows="6"
              disabled={saving}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visa-service-requirements">
              Requirements
            </label>

            <textarea
              id="visa-service-requirements"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              placeholder="List the requirements for this service."
              rows="6"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-service-processing-time">
              Processing Time
            </label>

            <input
              id="visa-service-processing-time"
              name="processing_time"
              type="text"
              value={form.processing_time}
              onChange={handleChange}
              placeholder="e.g. 4–8 weeks"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-service-display-order">
              Display Order
            </label>

            <input
              id="visa-service-display-order"
              name="display_order"
              type="number"
              min="0"
              value={form.display_order}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group full-width">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Active and available on the public website</span>
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
                ? "Update Visa Service"
                : "Create Visa Service"}
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
          <span className="eyebrow">Available Services</span>
          <h2>Visa Services</h2>
          <p>
            Manage the services currently configured for the
            website.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading visa services..." />
        ) : services.length === 0 ? (
          <div className="empty-state">
            <h2>No Visa Services</h2>
            <p>
              Create your first visa service using the form above.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <strong>{service.name}</strong>

                      {service.short_description && (
                        <div className="table-secondary-text">
                          {service.short_description}
                        </div>
                      )}
                    </td>

                    <td>{service.slug}</td>

                    <td>{service.display_order ?? 0}</td>

                    <td>
                      <span
                        className={
                          service.is_active
                            ? "status-badge status-approved"
                            : "status-badge status-closed"
                        }
                      >
                        {service.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {service.created_at
                        ? new Date(
                            service.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => startEdit(service)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => handleToggle(service)}
                        >
                          {service.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-small btn-danger"
                          onClick={() =>
                            handleDelete(service)
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
    </main>
  );
}

export default AdminVisaManagementPage;
