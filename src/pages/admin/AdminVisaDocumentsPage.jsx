import { useEffect, useState } from "react";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import {
  createVisaDocument,
  deleteAdminVisaDocument,
  getAdminVisaDocuments,
  getAdminVisaDocumentSignedUrl,
  setVisaDocumentVisibility,
  uploadAdminVisaDocument
} from "../../services/adminVisaDocumentService";
import { formatFileSize, formatDateTime } from "../../lib/formatters";

const EMPTY_FORM = {
  application_id: "",
  title: "",
  description: "",
  is_visible: true
};

function AdminVisaDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadDocuments() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminVisaDocuments();
      setDocuments(data);
    } catch (loadError) {
      console.error(
        "Unable to load visa documents:",
        loadError
      );

      setError(
        loadError?.message ||
          "Visa documents could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value
    }));
  }

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFile(null);

    const fileInput =
      document.getElementById(
        "visa-document-file"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  }

  function createStoragePath(
    applicationId,
    selectedFile
  ) {
    const extension =
      selectedFile.name.includes(".")
        ? selectedFile.name
            .split(".")
            .pop()
            .toLowerCase()
        : "";

    const uniquePart =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    return [
      applicationId,
      uniquePart +
        (extension ? `.${extension}` : "")
    ].join("/");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (!form.application_id.trim()) {
      setError("Application ID is required.");
      return;
    }

    if (!form.title.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!file) {
      setError("Please select a document file.");
      return;
    }

    setSaving(true);

    try {
      const storagePath = createStoragePath(
        form.application_id.trim(),
        file
      );

      const uploadResult =
        await uploadAdminVisaDocument({
          applicationId:
            form.application_id.trim(),
          file,
          storagePath
        });

      await createVisaDocument({
        application_id:
          form.application_id.trim(),
        title: form.title,
        description: form.description,
        file_name:
          uploadResult.file_name ||
          file.name,
        storage_path:
          uploadResult.storage_path ||
          storagePath,
        mime_type:
          uploadResult.mime_type ||
          file.type,
        file_size:
          uploadResult.file_size ||
          file.size,
        is_visible: form.is_visible
      });

      setSuccess(
        "Visa document uploaded successfully."
      );

      resetForm();
      await loadDocuments();
    } catch (saveError) {
      console.error(
        "Unable to upload visa document:",
        saveError
      );

      setError(
        saveError?.message ||
          "The visa document could not be uploaded."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleVisibility(
    document
  ) {
    setError("");
    setSuccess("");

    try {
      await setVisaDocumentVisibility(
        document.id,
        !document.is_visible
      );

      setSuccess(
        `Document ${
          !document.is_visible
            ? "made visible"
            : "hidden"
        } successfully.`
      );

      await loadDocuments();
    } catch (visibilityError) {
      console.error(
        "Unable to change document visibility:",
        visibilityError
      );

      setError(
        visibilityError?.message ||
          "Document visibility could not be changed."
      );
    }
  }

  async function handleOpenDocument(
    document
  ) {
    setError("");

    try {
      const signedUrl =
        await getAdminVisaDocumentSignedUrl(
          document.storage_path
        );

      window.open(
        signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (openError) {
      console.error(
        "Unable to open visa document:",
        openError
      );

      setError(
        openError?.message ||
          "The document could not be opened."
      );
    }
  }

  async function handleDelete(document) {
    const confirmed =
      window.confirm(
        `Delete "${document.title}"? This will remove the stored file and its database record.`
      );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteAdminVisaDocument(
        document.id
      );

      setSuccess(
        "Visa document deleted successfully."
      );

      await loadDocuments();
    } catch (deleteError) {
      console.error(
        "Unable to delete visa document:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "The visa document could not be deleted."
      );
    }
  }

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">
            Administration
          </span>

          <h1>Visa Documents</h1>

          <p>
            Upload documents for individual applications
            and control when applicants can see them.
          </p>
        </div>

        {error && (
          <AlertMessage
            type="error"
            title="Document error"
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
              Upload Document
            </span>

            <h2>
              Add Visa Document
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="form-grid"
          >
            <div className="form-group">
              <label htmlFor="visa-document-application-id">
                Application ID
              </label>

              <input
                id="visa-document-application-id"
                name="application_id"
                type="text"
                value={form.application_id}
                onChange={handleChange}
                placeholder="Enter application UUID"
                disabled={saving}
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

            <div className="form-group full-width">
              <label htmlFor="visa-document-description">
                Description
              </label>

              <textarea
                id="visa-document-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional document description"
                rows="4"
                disabled={saving}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="visa-document-file">
                Document File
              </label>

              <input
                id="visa-document-file"
                type="file"
                onChange={handleFileChange}
                disabled={saving}
                required
              />

              {file && (
                <small>
                  Selected: {file.name} (
                  {formatFileSize(file.size)})
                </small>
              )}

              <small>
                Maximum file size: 10 MB.
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="visa-document-visible">
                <input
                  id="visa-document-visible"
                  name="is_visible"
                  type="checkbox"
                  checked={form.is_visible}
                  onChange={handleChange}
                  disabled={saving}
                />

                Make document visible to applicant
              </label>
            </div>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Uploading..."
                  : "Upload Document"}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="card admin-table-section">
          <div className="section-heading">
            <span className="eyebrow">
              Stored Documents
            </span>

            <h2>
              Visa Documents
            </h2>
          </div>

          {loading ? (
            <Loading message="Loading visa documents..." />
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <h3>
                No visa documents found
              </h3>

              <p>
                Uploaded visa documents will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Applicant</th>
                    <th>Application Number</th>
                    <th>File</th>
                    <th>Visibility</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map(
                    (document) => (
                      <tr key={document.id}>
                        <td>
                          <strong>
                            {document.title}
                          </strong>

                          {document.description && (
                            <div className="admin-muted-text">
                              {
                                document.description
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {document.applications
                            ? `${document.applications.full_name || ""} ${
                                document.applications.surname || ""
                              }`.trim() ||
                              "—"
                            : "—"}
                        </td>

                        <td>
                          {document.applications
                            ?.application_number ||
                            "—"}
                        </td>

                        <td>
                          {document.file_name ||
                            "—"}

                          {document.file_size && (
                            <div className="admin-muted-text">
                              {formatFileSize(
                                document.file_size
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              document.is_visible
                                ? "status-approved"
                                : "status-closed"
                            }`}
                          >
                            {document.is_visible
                              ? "Visible"
                              : "Hidden"}
                          </span>
                        </td>

                        <td>
                          {formatDateTime(
                            document.created_at
                          )}
                        </td>

                        <td>
                          <div className="admin-table-actions">
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() =>
                                handleOpenDocument(
                                  document
                                )
                              }
                            >
                              Open
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() =>
                                handleVisibility(
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
                              className="btn btn-danger"
                              onClick={() =>
                                handleDelete(
                                  document
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
      </div>
    </main>
  );
}

export default AdminVisaDocumentsPage;
