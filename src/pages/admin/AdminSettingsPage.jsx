import { useEffect, useState } from "react";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import {
  createAdminProfile,
  deleteAdminProfile,
  getAdminUsers,
  updateAdminProfile
} from "../../services/adminUserService";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  id: "",
  full_name: "",
  role: "admin",
  is_active: true
};

function AdminSettingsPage() {
  const { admin } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadAdmins() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (loadError) {
      console.error(
        "Unable to load administrator accounts:",
        loadError
      );

      setError(
        loadError?.message ||
          "Administrator accounts could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleEdit(adminUser) {
    setEditingId(adminUser.id);

    setForm({
      id: adminUser.id,
      full_name: adminUser.full_name || "",
      role: adminUser.role || "admin",
      is_active: adminUser.is_active !== false
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
      if (editingId) {
        await updateAdminProfile(editingId, {
          full_name: form.full_name,
          role: form.role,
          is_active: form.is_active
        });

        setSuccess(
          "Administrator profile updated successfully."
        );
      } else {
        await createAdminProfile({
          id: form.id.trim(),
          full_name: form.full_name,
          role: form.role,
          is_active: form.is_active
        });

        setSuccess(
          "Administrator profile created successfully."
        );
      }

      resetForm();
      await loadAdmins();
    } catch (saveError) {
      console.error(
        "Unable to save administrator profile:",
        saveError
      );

      setError(
        saveError?.message ||
          "The administrator profile could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(adminUser) {
    if (adminUser.id === admin?.user?.id) {
      setError(
        "You cannot delete the administrator account currently in use."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete the administrator profile for ${
        adminUser.full_name || adminUser.id
      }?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteAdminProfile(adminUser.id);

      if (editingId === adminUser.id) {
        resetForm();
      }

      setSuccess(
        "Administrator profile deleted successfully."
      );

      await loadAdmins();
    } catch (deleteError) {
      console.error(
        "Unable to delete administrator profile:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "The administrator profile could not be deleted."
      );
    }
  }

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Administration</span>
          <h1>Admin Settings</h1>
          <p>
            Manage administrator profiles, roles, and account access.
          </p>
        </div>

        <AlertMessage
          type="info"
          title="Administrator account setup"
          message="The administrator user must first exist in Supabase Authentication. Enter that user's Supabase Auth User ID below to create or manage the corresponding administrator profile."
        />

        {error && (
          <AlertMessage
            type="error"
            title="Administrator settings error"
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
              {editingId
                ? "Edit Administrator"
                : "Add Administrator"}
            </span>

            <h2>
              {editingId
                ? "Update Administrator Profile"
                : "Create Administrator Profile"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="admin-user-id">
                Supabase Auth User ID
              </label>

              <input
                id="admin-user-id"
                name="id"
                type="text"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter the Supabase Auth user UUID"
                disabled={saving || Boolean(editingId)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-full-name">
                Full Name
              </label>

              <input
                id="admin-full-name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Administrator name"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-role">
                Role
              </label>

              <select
                id="admin-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={saving}
                required
              >
                <option value="admin">Admin</option>
                <option value="super_admin">
                  Super Admin
                </option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="admin-active">
                <input
                  id="admin-active"
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  disabled={saving}
                />
                Administrator account is active
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
                    ? "Update Administrator"
                    : "Create Administrator"}
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
            <span className="eyebrow">
              Administrator Accounts
            </span>
            <h2>Authorized Administrators</h2>
          </div>

          {loading ? (
            <Loading message="Loading administrator accounts..." />
          ) : admins.length === 0 ? (
            <div className="empty-state">
              <h3>No administrator profiles found</h3>
              <p>
                Create an administrator profile after creating the
                corresponding user in Supabase Authentication.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((adminUser) => (
                    <tr key={adminUser.id}>
                      <td>
                        <strong>
                          {adminUser.full_name ||
                            "Unnamed Administrator"}
                        </strong>
                        <div className="admin-muted-text">
                          {adminUser.id}
                        </div>
                      </td>

                      <td>
                        {adminUser.role === "super_admin"
                          ? "Super Admin"
                          : "Admin"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            adminUser.is_active
                              ? "status-approved"
                              : "status-closed"
                          }`}
                        >
                          {adminUser.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {adminUser.created_at
                          ? new Date(
                              adminUser.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              handleEdit(adminUser)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              handleDelete(adminUser)
                            }
                            disabled={
                              adminUser.id === admin?.user?.id
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

export default AdminSettingsPage;
