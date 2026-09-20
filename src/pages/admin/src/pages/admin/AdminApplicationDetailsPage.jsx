import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import {
  getAdminApplicationById,
  assignApplicationNumber,
  updateApplicationProcessing,
  updateApplicationDecision,
  updatePassportInstructions
} from "../../services/adminApplicationService";
import {
  APPLICATION_STATUS_OPTIONS,
  ELIGIBILITY_STATUS_OPTIONS,
  BACKGROUND_CHECK_STATUS_OPTIONS,
  BIOMETRICS_STATUS_OPTIONS,
  MEDICAL_STATUS_OPTIONS,
  ADDITIONAL_DOCUMENTS_STATUS_OPTIONS,
  DECISION_STATUS_OPTIONS
} from "../../lib/constants";
import { formatDateTime } from "../../lib/formatters";

function AdminApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [applicationNumber, setApplicationNumber] = useState("");
  const [processing, setProcessing] = useState({
    application_status: "",
    eligibility_status: "",
    background_check_status: "",
    biometrics_status: "",
    medical_status: "",
    additional_documents_status: ""
  });
  const [decisionStatus, setDecisionStatus] = useState("");
  const [passportInstructions, setPassportInstructions] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [savingNumber, setSavingNumber] = useState(false);
  const [savingProcessing, setSavingProcessing] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);
  const [savingPassport, setSavingPassport] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadApplication() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminApplicationById(applicationId);

      if (!data) {
        throw new Error("The requested application was not found.");
      }

      setApplication(data);
      setApplicationNumber(data.application_number || "");

      setProcessing({
        application_status: data.application_status || "",
        eligibility_status: data.eligibility_status || "",
        background_check_status:
          data.background_check_status || "",
        biometrics_status: data.biometrics_status || "",
        medical_status: data.medical_status || "",
        additional_documents_status:
          data.additional_documents_status || ""
      });

      setDecisionStatus(data.decision_status || "");
      setPassportInstructions(
        data.passport_instructions || ""
      );
    } catch (requestError) {
      console.error(
        "Unable to load application details:",
        requestError
      );

      setError(
        requestError?.message ||
          "The application could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleAssignApplicationNumber(event) {
    event.preventDefault();
    clearMessages();

    if (!applicationNumber.trim()) {
      setError("Application Number is required.");
      return;
    }

    setSavingNumber(true);

    try {
      const updatedApplication =
        await assignApplicationNumber(
          applicationId,
          applicationNumber
        );

      setApplication(updatedApplication);
      setApplicationNumber(
        updatedApplication.application_number || ""
      );

      setSuccess("Application Number updated successfully.");
    } catch (requestError) {
      console.error(
        "Unable to assign Application Number:",
        requestError
      );

      setError(
        requestError?.message ||
          "The Application Number could not be assigned."
      );
    } finally {
      setSavingNumber(false);
    }
  }

  async function handleProcessingSubmit(event) {
    event.preventDefault();
    clearMessages();
    setSavingProcessing(true);

    try {
      const updatedApplication =
        await updateApplicationProcessing(
          applicationId,
          processing
        );

      setApplication(updatedApplication);

      setProcessing({
        application_status:
          updatedApplication.application_status || "",
        eligibility_status:
          updatedApplication.eligibility_status || "",
        background_check_status:
          updatedApplication.background_check_status || "",
        biometrics_status:
          updatedApplication.biometrics_status || "",
        medical_status:
          updatedApplication.medical_status || "",
        additional_documents_status:
          updatedApplication.additional_documents_status || ""
      });

      setSuccess(
        "Processing status updated successfully."
      );
    } catch (requestError) {
      console.error(
        "Unable to update processing status:",
        requestError
      );

      setError(
        requestError?.message ||
          "The processing status could not be updated."
      );
    } finally {
      setSavingProcessing(false);
    }
  }

  async function handleDecisionSubmit(event) {
    event.preventDefault();
    clearMessages();
    setSavingDecision(true);

    try {
      const updatedApplication =
        await updateApplicationDecision(
          applicationId,
          decisionStatus
        );

      setApplication(updatedApplication);
      setDecisionStatus(
        updatedApplication.decision_status || ""
      );

      setSuccess("Decision updated successfully.");
    } catch (requestError) {
      console.error(
        "Unable to update decision:",
        requestError
      );

      setError(
        requestError?.message ||
          "The decision could not be updated."
      );
    } finally {
      setSavingDecision(false);
    }
  }

  async function handlePassportSubmit(event) {
    event.preventDefault();
    clearMessages();
    setSavingPassport(true);

    try {
      const updatedApplication =
        await updatePassportInstructions(
          applicationId,
          passportInstructions
        );

      setApplication(updatedApplication);
      setPassportInstructions(
        updatedApplication.passport_instructions || ""
      );

      setSuccess(
        "Passport instructions updated successfully."
      );
    } catch (requestError) {
      console.error(
        "Unable to update passport instructions:",
        requestError
      );

      setError(
        requestError?.message ||
          "Passport instructions could not be updated."
      );
    } finally {
      setSavingPassport(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-page">
        <Loading message="Loading application details..." />
      </main>
    );
  }

  if (!application) {
    return (
      <main className="admin-page">
        <AlertMessage
          type="error"
          title="Application unavailable"
          message={
            error ||
            "The requested application could not be found."
          }
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

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">
            Application Management
          </span>

          <h1>Application Details</h1>

          <p>
            Review the application and manage its processing
            information.
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="btn btn-outline"
        >
          Back to Applications
        </Link>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Update Error"
          message={error}
        />
      )}

      {success && (
        <AlertMessage
          type="success"
          title="Update Successful"
          message={success}
        />
      )}

      <section className="admin-card">
        <div className="admin-detail-header">
          <div>
            <span className="eyebrow">
              Application Number
            </span>

            <h2>
              {application.application_number ||
                "Not Assigned"}
            </h2>
          </div>

          <div className="status-group">
            <StatusBadge
              status={application.application_status}
            />

            <StatusBadge
              status={application.decision_status}
            />
          </div>
        </div>

        <form
          onSubmit={handleAssignApplicationNumber}
          className="form-grid"
        >
          <div className="form-group">
            <label htmlFor="application-number">
              Assign Application Number
            </label>

            <input
              id="application-number"
              type="text"
              value={applicationNumber}
              onChange={(event) =>
                setApplicationNumber(event.target.value)
              }
              placeholder="Enter Application Number"
              disabled={savingNumber}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                savingNumber ||
                !applicationNumber.trim()
              }
            >
              {savingNumber
                ? "Saving..."
                : "Save Application Number"}
            </button>
          </div>
        </form>
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
            <strong>
              {application.date_of_birth || "—"}
            </strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>{application.gender || "—"}</strong>
          </div>

          <div>
            <span>Nationality</span>
            <strong>
              {application.nationality || "—"}
            </strong>
          </div>

          <div>
            <span>Country of Origin</span>
            <strong>
              {application.country_of_origin || "—"}
            </strong>
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
            <strong>
              {application.residential_address || "—"}
            </strong>
          </div>

          <div>
            <span>Occupation</span>
            <strong>
              {application.occupation || "—"}
            </strong>
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
            <strong>
              {application.passport_number || "—"}
            </strong>
          </div>

          <div>
            <span>Issue Date</span>
            <strong>
              {application.passport_issue_date || "—"}
            </strong>
          </div>

          <div>
            <span>Expiry Date</span>
            <strong>
              {application.passport_expiry_date || "—"}
            </strong>
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
            <strong>
              {application.visa_type || "—"}
            </strong>
          </div>

          <div>
            <span>Work Permit Type</span>
            <strong>
              {application.work_permit_type || "—"}
            </strong>
          </div>

          <div>
            <span>Destination Country</span>
            <strong>
              {application.destination_country || "—"}
            </strong>
          </div>

          <div>
            <span>Country of Processing</span>
            <strong>
              {application.country_of_processing || "—"}
            </strong>
          </div>

          <div>
            <span>Application Date</span>
            <strong>
              {application.application_date || "—"}
            </strong>
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

        <form
          onSubmit={handleProcessingSubmit}
          className="form-grid"
        >
          <div className="form-group">
            <label htmlFor="application-status">
              Application Status
            </label>

            <select
              id="application-status"
              value={processing.application_status}
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  application_status:
                    event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {APPLICATION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="eligibility-status">
              Eligibility
            </label>

            <select
              id="eligibility-status"
              value={processing.eligibility_status}
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  eligibility_status:
                    event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {ELIGIBILITY_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="background-check-status">
              Background Check
            </label>

            <select
              id="background-check-status"
              value={processing.background_check_status}
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  background_check_status:
                    event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {BACKGROUND_CHECK_STATUS_OPTIONS.map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="biometrics-status">
              Biometrics
            </label>

            <select
              id="biometrics-status"
              value={processing.biometrics_status}
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  biometrics_status:
                    event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {BIOMETRICS_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="medical-status">
              Medical
            </label>

            <select
              id="medical-status"
              value={processing.medical_status}
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  medical_status: event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {MEDICAL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="additional-documents-status">
              Additional Documents
            </label>

            <select
              id="additional-documents-status"
              value={
                processing.additional_documents_status
              }
              onChange={(event) =>
                setProcessing({
                  ...processing,
                  additional_documents_status:
                    event.target.value
                })
              }
              disabled={savingProcessing}
            >
              {ADDITIONAL_DOCUMENTS_STATUS_OPTIONS.map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProcessing}
            >
              {savingProcessing
                ? "Saving..."
                : "Save Processing Status"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Decision</span>
          <h2>Application Decision</h2>
        </div>

        <form
          onSubmit={handleDecisionSubmit}
          className="form-grid"
        >
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
              disabled={savingDecision}
            >
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
              disabled={savingDecision}
            >
              {savingDecision
                ? "Saving..."
                : "Save Decision"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="section-heading">
          <span className="eyebrow">Passport</span>
          <h2>Passport Submission Instructions</h2>
          <p>
            These instructions can be displayed to the applicant
            through the application status page.
          </p>
        </div>

        <form
          onSubmit={handlePassportSubmit}
          className="form-grid"
        >
          <div className="form-group full-width">
            <label htmlFor="passport-instructions">
              Instructions
            </label>

            <textarea
              id="passport-instructions"
              value={passportInstructions}
              onChange={(event) =>
                setPassportInstructions(
                  event.target.value
                )
              }
              rows="6"
              placeholder="Enter passport submission instructions..."
              disabled={savingPassport}
            />
          </div>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassport}
            >
              {savingPassport
                ? "Saving..."
                : "Save Passport Instructions"}
            </button>
          </div>
        </form>
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
