import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import {
  getAdminApplications
} from "../../services/adminApplicationService";
import {
  APPLICATION_STATUS_OPTIONS,
  DECISION_STATUS_OPTIONS
} from "../../lib/constants";
import { formatDateTime } from "../../lib/formatters";

function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [decisionStatus, setDecisionStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplications(filters = {}) {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminApplications(filters);
      setApplications(data);
    } catch (requestError) {
      console.error("Unable to load applications:", requestError);
      setError(
        requestError?.message ||
          "Applications could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    await loadApplications({
      search,
      applicationStatus,
      decisionStatus
    });
  }

  async function handleClearFilters() {
    setSearch("");
    setApplicationStatus("");
    setDecisionStatus("");

    await loadApplications();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Applications</h1>
          <p>
            View, search, and manage submitted applications.
          </p>
        </div>
      </div>

      <section className="admin-card">
        <form onSubmit={handleSearch} className="form-grid">
          <div className="form-group">
            <label htmlFor="application-search">
              Search Applications
            </label>

            <input
              id="application-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, surname, email, or Application Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="application-status">
              Application Status
            </label>

            <select
              id="application-status"
              value={applicationStatus}
              onChange={(event) =>
                setApplicationStatus(event.target.value)
              }
            >
              <option value="">All statuses</option>

              {APPLICATION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="decision-status">
              Decision
            </label>

            <select
              id="decision-status"
              value={decisionStatus}
              onChange={(event) =>
                setDecisionStatus(event.target.value)
              }
            >
              <option value="">All decisions</option>

              {DECISION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {error && (
        <AlertMessage
          type="error"
          title="Applications unavailable"
          message={error}
        />
      )}

      {loading ? (
        <Loading message="Loading applications..." />
      ) : applications.length === 0 ? (
        <section className="admin-card">
          <div className="empty-state">
            <h2>No Applications Found</h2>
            <p>
              No applications match the current search or filter criteria.
            </p>
          </div>
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application Number</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Visa Type</th>
                  <th>Application Status</th>
                  <th>Decision</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      {application.application_number || "Not Assigned"}
                    </td>

                    <td>
                      {application.full_name}{" "}
                      {application.surname || ""}
                    </td>

                    <td>{application.email}</td>

                    <td>
                      {application.visa_type || "—"}
                    </td>

                    <td>
                      <StatusBadge
                        status={application.application_status}
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={application.decision_status}
                      />
                    </td>

                    <td>
                      {formatDateTime(application.created_at)}
                    </td>

                    <td>
                      <Link
                        to={`/admin/applications/${application.id}`}
                        className="btn btn-small btn-outline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminApplicationsPage;
