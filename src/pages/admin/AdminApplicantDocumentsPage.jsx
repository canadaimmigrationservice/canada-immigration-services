import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import {
  getAdminApplicantDocuments,
  deleteAdminApplicantDocument
} from "../../services/adminDocumentService";
import { formatDateTime, formatFileSize } from "../../lib/formatters";

function AdminApplicantDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDocuments(filters = {}) {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminApplicantDocuments(filters);
      setDocuments(data);
    } catch (requestError) {
      console.error(
        "Unable to load applicant documents:",
        requestError
      );

      setError(
        requestError?.message ||
          "Applicant documents could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    await loadDocuments({
      applicationId: applicationId.trim()
    });
  }

  async function handleClear() {
    setApplicationId("");
    await loadDocuments();
  }

  async function handleDelete(document) {
    const confirmed = window.confirm(
      `Delete "${document.file_name || "this document"}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(document.id);
    setError("");
    setSuccess("");

    try {
      await deleteAdminApplicantDocument(document.id);

      setSuccess("Applicant document deleted successfully.");

      await loadDocuments({
        applicationId: applicationId.trim()
      });
    } catch (requestError) {
      console.error(
        "Unable to delete applicant document:",
        requestError
      );

      setError(
        requestError?.message ||
          "The applicant document could not be deleted."
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
          <h1>Applicant Documents</h1>
          <p>
            Review documents submitted by applicants and manage
            stored document records.
          </p>
        </div>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Document Management Error"
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
          <span className="eyebrow">Document Search</span>
          <h2>Find Applicant Documents</h2>
          <p>
            Enter an Application ID to view documents associated
            with a specific application.
          </p>
        </div>

        <form onSubmit={handleSearch} className="form-grid">
          <div className="form-group">
            <label htmlFor="document-application-id">
              Application ID
            </label>

            <input
              id="document-application-id"
              type="text"
              value={applicationId}
              onChange={(event) =>
                setApplicationId(event.target.value)
              }
              placeholder="Enter application ID"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Submitted Files</span>
          <h2>Applicant Documents</h2>
          <p>
            Documents are stored privately and are not directly
            exposed through the public website.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading applicant documents..." />
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h2>No Documents Found</h2>
            <p>
              There are currently no applicant documents matching
              the selected criteria.
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
                  <th>File Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Action</th>
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
                          {document.file_name || "Unnamed file"}
                        </strong>

                        {document.document_type && (
                          <div className="table-secondary-text">
                            {document.document_type}
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
                        {document.mime_type || "—"}
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

export default AdminApplicantDocumentsPage;
