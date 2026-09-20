import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import {
  getAdminApplicationById
} from "../../services/adminApplicationService";
import { formatDateTime } from "../../lib/formatters";

function AdminApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadApplication() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminApplicationById(applicationId);

        if (!data) {
          throw new Error("The requested application was not found.");
        }

        if (mounted) {
          setApplication(data);
        }
      } catch (requestError) {
        console.error(
          "Unable to load application details:",
          requestError
        );

        if (mounted) {
          setError(
            requestError?.message ||
              "The application could not be loaded."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadApplication();

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <main className="admin-page">
        <Loading message="Loading application details..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <AlertMessage
          type="error"
          title="Application unavailable"
          message={error}
        />

        <div className="form-actions">
          <Link
            to="/admin/applications"
            className="btn btn-outline"
          >
            Back to Applications
          </Link>
        </div>
      </main>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Application Management</span>
          <h1>Application Details</h1>
          <p>
            Review the complete application information and processing
            status.
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="btn btn-outline"
        >
          Back to Applications
        </Link>
      </div>

      <section className="admin-card">
        <div className="admin-detail-header">
          <div>
            <span className="eyebrow">Application Number</span>
            <h2>
              {application.application_number || "Not Assigned"}
            </h2>
          </div>

          <div className="status-group">
            <StatusBadge status={application.application_status} />
            <StatusBadge status={application.decision_status} />
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Applicant</span>
          <h2>Applicant Information</h2>
        </div>

        <div className="admin-detail-grid">
          <div>
            <span>Full Name</span>
            <strong>{application.full_name || "—"}</strong>
          </div>

          <div>
            <span>Surname</span>
            <strong>{application.surname || "—"}</strong>
          </div>

          <div>
            <span>Date of Birth</span>
            <strong>{application.date_of_birth || "—"}</strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>{application.gender || "—"}</strong>
          </div>

          <div>
            <span>Nationality</span>
            <strong>{application.nationality || "—"}</strong>
          </div>

          <div>
            <span>Country of Origin</span>
            <strong>{application.country_of_origin || "—"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{application.email || "—"}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{application.phone || "—"}</strong>
          </div>

          <div className="full-width">
            <span>Residential Address</span>
            <strong>{application.residential_address || "—"}</strong>
          </div>

          <div>
            <span>Occupation</span>
            <strong>{application.occupation || "—"}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Passport</span>
          <h2>Passport Information</h2>
        </div>

        <div className="admin-detail-grid">
          <div>
            <span>Passport Number</span>
            <strong>{application.passport_number || "—"}</strong>
          </div>

          <div>
            <span>Issue Date</span>
            <strong>{application.passport_issue_date || "—"}</strong>
          </div>

          <div>
            <span>Expiry Date</span>
            <strong>{application.passport_expiry_date || "—"}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Application</span>
          <h2>Application Information</h2>
        </div>

        <div className="admin-detail-grid">
          <div>
            <span>Visa Type</span>
            <strong>{application.visa_type || "—"}</strong>
          </div>

          <div>
            <span>Work Permit Type</span>
            <strong>{application.work_permit_type || "—"}</strong>
          </div>

          <div>
            <span>Destination Country</span>
            <strong>{application.destination_country || "—"}</strong>
          </div>

          <div>
            <span>Country of Processing</span>
            <strong>{application.country_of_processing || "—"}</strong>
          </div>

          <div>
            <span>Application Date</span>
            <strong>{application.application_date || "—"}</strong>
          </div>

          <div className="full-width">
            <span>Services Requested</span>
            <strong>
              {application.services_requested || "—"}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Processing</span>
          <h2>Processing Status</h2>
        </div>

        <div className="admin-detail-grid">
          <div>
            <span>Application Status</span>
            <strong>
              {application.application_status || "—"}
            </strong>
          </div>

          <div>
            <span>Eligibility</span>
            <strong>
              {application.eligibility_status || "—"}
            </strong>
          </div>

          <div>
            <span>Background Check</span>
            <strong>
              {application.background_check_status || "—"}
            </strong>
          </div>

          <div>
            <span>Biometrics</span>
            <strong>
              {application.biometrics_status || "—"}
            </strong>
          </div>

          <div>
            <span>Medical</span>
            <strong>{application.medical_status || "—"}</strong>
          </div>

          <div>
            <span>Additional Documents</span>
            <strong>
              {application.additional_documents_status || "—"}
            </strong>
          </div>

          <div>
            <span>Decision</span>
            <strong>{application.decision_status || "—"}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Passport</span>
          <h2>Passport Instructions</h2>
        </div>

        <div className="admin-detail-grid">
          <div className="full-width">
            <span>Instructions</span>
            <strong>
              {application.passport_instructions || "Not provided"}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Record</span>
          <h2>Application Timeline</h2>
        </div>

        <div className="admin-detail-grid">
          <div>
            <span>Created</span>
            <strong>
              {formatDateTime(application.created_at)}
            </strong>
          </div>

          <div>
            <span>Last Updated</span>
            <strong>
              {formatDateTime(application.updated_at)}
            </strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminApplicationDetailsPage;
