import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import {
  getAdminVisaDocuments,
  createVisaDocument,
  updateVisaDocument,
  setVisaDocumentVisibility,
  deleteAdminVisaDocument
} from "../../services/adminVisaDocumentService";
import {
  formatDateTime,
  formatFileSize
} from "../../lib/formatters";

const emptyForm = {
  application_id: "",
  title: "",
  description: "",
  file_name: "",
  storage_path: "",
  mime_type: "",
  file_size: "",
  is_visible: true
};

function AdminVisaDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDocuments() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminVisaDocuments();
      setDocuments(data);
    } catch (requestError) {
      console.error(
        "Unable to load visa documents:",
        requestError
      );

      setError(
        requestError?.message ||
          "Visa documents could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
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

  function startEdit(document) {
    setEditingId(document.id);

    setForm({
      application_id: document.application_id || "",
      title: document.title || "",
      description: document.description || "",
      file_name: document.file_name || "",
      storage_path: document.storage_path || "",
      mime_type: document.mime_type || "",
      file_size: document.file_size ?? "",
      is_visible: document.is_visible !== false
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
        await updateVisaDocument(editingId, {
          title: form.title,
          description: form.description,
          file_name: form.file_name,
          storage_path: form.storage_path,
          mime_type: form.mime_type,
          file_size: form.file_size,
          is_visible: form.is_visible
        });

        setSuccess("Visa document updated successfully.");
      } else {
        await createVisaDocument(form);

        setSuccess("Visa document created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadDocuments();
    } catch (requestError) {
      console.error(
        "Unable to save visa document:",
        requestError
      );

      setError(
        requestError?.message ||
          "The visa document could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleVisibilityToggle(document) {
    setError("");
    setSuccess("");

    try {
      await setVisaDocumentVisibility(
        document.id,
        !document.is_visible
      );

      setSuccess(
        document.is_visible
          ? "Visa document is now hidden from the applicant."
          : "Visa document is now visible to the applicant."
      );

      await loadDocuments();
    } catch (requestError) {
      console.error(
        "Unable to update visa document visibility:",
        requestError
      );

      setError(
        requestError?.message ||
          "Document visibility could not be updated."
      );
    }
  }

  async function handleDelete(document) {
    const confirmed = window.confirm(
      `Delete "${document.title || document.file_name || "this document"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(document.id);
    setError("");
    setSuccess("");

    try {
      await deleteAdminVisaDocument(document.id);

      if (editingId === document.id) {
        cancelEdit();
      }

      setSuccess("Visa document deleted successfully.");

      await loadDocuments();
    } catch (requestError) {
      console.error(
        "Unable to delete visa document:",
        requestError
      );

      setError(
        requestError?.message ||
          "The visa document could not be deleted."
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
          <h1>Visa Documents</h1>
          <p>
            Upload and manage documents that administrators make
            available to applicants.
          </p>
        </div>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Visa Document Error"
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
            {editingId ? "Edit Document" : "Add Document"}
          </span>

          <h2>
            {editingId
              ? "Edit Visa Document"
              : "Add Visa Document"}
          </h2>

          <p>
            This form manages the document record. Secure file
            upload will be connected separately through private
            storage.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="visa-document-application-id">
              Application ID
            </label>

            <input
              id="visa-document-application-id"
              name="application_id"
              type="text"
              value={form.application_id}
              onChange={handleChange}
              placeholder="Enter the application ID"
              disabled={saving || Boolean(editingId)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-document-title">
              Document Title
            </label>

            <input
              id="visa-document-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Visa Approval Letter"
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-document-file-name">
              File Name
            </label>

            <input
              id="visa-document-file-name"
              name="file_name"
              type="text"
              value={form.file_name}
              onChange={handleChange}
              placeholder="e.g. approval-letter.pdf"
              disabled={saving}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visa-document-description">
              Description
            </label>

            <textarea
              id="visa-document-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe this document for the applicant."
              rows="4"
              disabled={saving}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visa-document-storage-path">
              Storage Path
            </label>

            <input
              id="visa-document-storage-path"
              name="storage_path"
              type="text"
              value={form.storage_path}
              onChange={handleChange}
              placeholder="Private storage path"
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-document-mime-type">
              MIME Type
            </label>

            <input
              id="visa-document-mime-type"
              name="mime_type"
              type="text"
              value={form.mime_type}
              onChange={handleChange}
              placeholder="application/pdf"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visa-document-file-size">
              File Size (bytes)
            </label>

            <input
              id="visa-document-file-size"
              name="file_size"
              type="number"
              min="0"
              value={form.file_size}
              onChange={handleChange}
              placeholder="0"
              disabled={saving}
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
                Make this document visible to the applicant
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
                ? "Update Visa Document"
                : "Add Visa Document"}
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
          <span className="eyebrow">Managed Documents</span>
          <h2>Visa Documents</h2>
          <p>
            Review documents associated with applicant
            applications.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading visa documents..." />
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h2>No Visa Documents</h2>
            <p>
              No administrator visa documents have been added
              yet.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Applicant</th>
                  <th>Application Number</th>
                  <th>Visibility</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => {
                  const application =
                    document.applications;

                  return (
                    <tr key={document.id}>
                      <td>
                        <strong>
                          {document.title ||
                            document.file_name ||
                            "Unnamed document"}
                        </strong>

                        {document.file_name && (
                          <div className="table-secondary-text">
                            {document.file_name}
                          </div>
                        )}
                      </td>

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

                      <td>
                        <span
                          className={
                            document.is_visible
                              ? "status-badge status-approved"
                              : "status-badge status-closed"
                          }
                        >
                          {document.is_visible
                            ? "Visible"
                            : "Hidden"}
                        </span>
                      </td>

                      <td>
                        {document.file_size
                          ? formatFileSize(
                              document.file_size
                            )
                          : "—"}
                      </td>

                      <td>
                        {document.created_at
                          ? formatDateTime(
                              document.created_at
                            )
                          : "—"}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-small btn-outline"
                            onClick={() =>
                              startEdit(document)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-small btn-outline"
                            onClick={() =>
                              handleVisibilityToggle(
                                document
                              )
                            }
                          >
                            {document.is_visible
                              ? "Hide"
                              : "Show"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() =>
                              handleDelete(document)
                            }
                            disabled={
                              deletingId === document.id
                            }
                          >
                            {deletingId === document.id
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

export default AdminVisaDocumentsPage;
