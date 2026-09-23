import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  assignApplicationNumber,
  deleteAdminApplication,
  getAdminApplicationById,
  updateApplicationDecision,
  updateApplicationProcessing,
  updatePassportInstructions
} from "../../services/adminApplicationService";

function AdminApplicationDetailsPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [applicationNumber, setApplicationNumber] =
    useState("");

  const [processing, setProcessing] = useState({
    application_status: "",
    eligibility_status: "",
    background_check_status: "",
    biometrics_status: "",
    medical_status: "",
    additional_documents_status: ""
  });

  const [decision, setDecision] = useState({
    decision_status: "",
    decision_message: ""
  });

  const [passport, setPassport] = useState({
    passport_submission_visible: false,
    passport_instructions: ""
  });

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  async function loadApplication() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data =
        await getAdminApplicationById(
          applicationId
        );

      if (!data) {
        setError("Application not found.");
        return;
      }

      setApplication(data);

      setApplicationNumber(
        data.application_number || ""
      );

      setProcessing({
        application_status:
          data.application_status || "",
        eligibility_status:
          data.eligibility_status || "",
        background_check_status:
          data.background_check_status || "",
        biometrics_status:
          data.biometrics_status || "",
        medical_status:
          data.medical_status || "",
        additional_documents_status:
          data.additional_documents_status || ""
      });

      setDecision({
        decision_status:
          data.decision_status || "",
        decision_message:
          data.decision_message || ""
      });

      setPassport({
        passport_submission_visible:
          Boolean(
            data.passport_submission_visible
          ),
        passport_instructions:
          data.passport_instructions || ""
      });
    } catch (err) {
      setError(
        err.message ||
          "The application could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignApplicationNumber(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated =
        await assignApplicationNumber(
          applicationId,
          applicationNumber
        );

      setApplication(updated);
      setMessage(
        "Application Number assigned successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Application Number could not be assigned."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleProcessingUpdate(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated =
        await updateApplicationProcessing(
          applicationId,
          processing
        );

      setApplication(updated);

      setMessage(
        "Application processing information updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Application processing information could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDecisionUpdate(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated =
        await updateApplicationDecision(
          applicationId,
          decision
        );

      setApplication(updated);

      setMessage(
        "Decision information updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Decision information could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePassportUpdate(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated =
        await updatePassportInstructions(
          applicationId,
          passport
        );

      setApplication(updated);

      setMessage(
        "Passport instructions updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Passport instructions could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this application? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteAdminApplication(
        applicationId
      );

      navigate("/admin/applications");
    } catch (err) {
      setError(
        err.message ||
          "The application could not be deleted."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-section">
        <div className="container">
          <p>Loading application...</p>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="page-section">
        <div className="container">
          <h1>Application Not Found</h1>

          <p>
            {error ||
              "The requested application could not be found."}
          </p>

          <Link
            to="/admin/applications"
            className="button"
          >
            Back to Applications
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-section">
      <div className="container">
        <div className="admin-page-header">
          <div>
            <Link
              to="/admin/applications"
              className="admin-back-link"
            >
              ← Back to Applications
            </Link>

            <h1>
              Application Details
            </h1>

            <p>
              Review and manage this applicant's
              application.
            </p>
          </div>

          <button
            type="button"
            className="button button-danger"
            onClick={handleDelete}
            disabled={saving}
          >
            Delete Application
          </button>
        </div>

        {error ? (
          <div className="alert alert-error">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="alert alert-success">
            {message}
          </div>
        ) : null}

        <section className="admin-card">
          <h2>Applicant Information</h2>

          <div className="admin-detail-grid">
            <div>
              <strong>Full Name</strong>
              <span>
                {application.full_name || "—"}
              </span>
            </div>

            <div>
              <strong>Surname</strong>
              <span>
                {application.surname || "—"}
              </span>
            </div>

            <div>
              <strong>Email</strong>
              <span>
                {application.email || "—"}
              </span>
            </div>

            <div>
              <strong>Phone</strong>
              <span>
                {application.phone || "—"}
              </span>
            </div>

            <div>
              <strong>Date of Birth</strong>
              <span>
                {application.date_of_birth ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Gender</strong>
              <span>
                {application.gender || "—"}
              </span>
            </div>

            <div>
              <strong>Nationality</strong>
              <span>
                {application.nationality ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Country of Origin</strong>
              <span>
                {application.country_of_origin ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Occupation</strong>
              <span>
                {application.occupation || "—"}
              </span>
            </div>

            <div>
              <strong>Residential Address</strong>
              <span>
                {application.residential_address ||
                  "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h2>Passport Information</h2>

          <div className="admin-detail-grid">
            <div>
              <strong>Passport Number</strong>
              <span>
                {application.passport_number ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Issue Date</strong>
              <span>
                {application.passport_issue_date ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Expiry Date</strong>
              <span>
                {application.passport_expiry_date ||
                  "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h2>Application Information</h2>

          <div className="admin-detail-grid">
            <div>
              <strong>Visa Type</strong>
              <span>
                {application.visa_type || "—"}
              </span>
            </div>

            <div>
              <strong>Work Permit Type</strong>
              <span>
                {application.work_permit_type ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Destination Country</strong>
              <span>
                {application.destination_country ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Country of Processing</strong>
              <span>
                {application.country_of_processing ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Application Date</strong>
              <span>
                {application.application_date ||
                  "—"}
              </span>
            </div>

            <div>
              <strong>Services Requested</strong>
              <span>
                {application.services_requested ||
                  "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h2>Application Number</h2>

          <form
            onSubmit={
              handleAssignApplicationNumber
            }
          >
            <label htmlFor="application-number">
              Application Number
            </label>

            <input
              id="application-number"
              type="text"
              value={applicationNumber}
              onChange={(event) =>
                setApplicationNumber(
                  event.target.value
                )
              }
              placeholder="Enter Application Number"
            />

            <button
              type="submit"
              className="button"
              disabled={saving}
            >
              Save Application Number
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Processing Status</h2>

          <form
            onSubmit={
              handleProcessingUpdate
            }
          >
            <div className="admin-form-grid">
              <div>
                <label>
                  Application Status
                </label>

                <select
                  value={
                    processing.application_status
                  }
                  onChange={(event) =>
                    setProcessing({
                      ...processing,
                      application_status:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="Submitted">
                    Submitted
                  </option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Closed">
                    Closed
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Eligibility
                </label>

                <select
                  value={
                    processing.eligibility_status
                  }
                  onChange={(event) =>
                    setProcessing({
                      ...processing,
                      eligibility_status:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="Not Started">
                    Not Started
                  </option>
                  <option value="Assessing">
                    Assessing
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Background Check
                </label>

                <select
                  value={
                    processing.background_check_status
                  }
                  onChange={(event) =>
                    setProcessing({
                      ...processing,
                      background_check_status:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="Not Started">
                    Not Started
                  </option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Biometrics
                </label>

                <select
                  value={
                    processing.biometrics_status
                  }
                  onChange={(event) =>
                    setProcessing({
                      ...processing,
                      biometrics_status:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="Not Received">
                    Not Received
                  </option>
                  <option value="Received">
                    Received
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Medical
                </label>

                <select
                  value={
                    processing.medical_status
                  }
                  onChange={(event) =>
                    setProcessing({
                      ...processing,
                      medical_status:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="Not Required">
                    Not Required
                  </option>
                  <option value="Required">
                    Required
                  </option>
                  <option value="Received">
                    Received
                  </option>
                  <option value="Under Review">
                    Under Review
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Additional Documents
                </label>

                <select
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
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="None">
                    None
                  </option>
                  <option value="Requested">
                    Requested
                  </option>
                  <option value="Received">
                    Received
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="button"
              disabled={saving}
            >
              Save Processing Status
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Decision</h2>

          <form
            onSubmit={handleDecisionUpdate}
          >
            <label>
              Decision Status
            </label>

            <select
              value={
                decision.decision_status
              }
              onChange={(event) =>
                setDecision({
                  ...decision,
                  decision_status:
                    event.target.value
                })
              }
            >
              <option value="">
                Select decision
              </option>
              <option value="Pending">
                Pending
              </option>
              <option value="Approved">
                Approved
              </option>
              <option value="Rejected">
                Rejected
              </option>
            </select>

            <label>
              Decision Message
            </label>

            <textarea
              rows="5"
              value={
                decision.decision_message
              }
              onChange={(event) =>
                setDecision({
                  ...decision,
                  decision_message:
                    event.target.value
                })
              }
              placeholder="Enter decision message"
            />

            <button
              type="submit"
              className="button"
              disabled={saving}
            >
              Save Decision
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Passport Submission</h2>

          <form
            onSubmit={
              handlePassportUpdate
            }
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={
                  passport.passport_submission_visible
                }
                onChange={(event) =>
                  setPassport({
                    ...passport,
                    passport_submission_visible:
                      event.target.checked
                  })
                }
              />

              Show passport submission
              information to applicant
            </label>

            <label>
              Passport Instructions
            </label>

            <textarea
              rows="7"
              value={
                passport.passport_instructions
              }
              onChange={(event) =>
                setPassport({
                  ...passport,
                  passport_instructions:
                    event.target.value
                })
              }
              placeholder="Enter passport submission instructions"
            />

            <button
              type="submit"
              className="button"
              disabled={saving}
            >
              Save Passport Instructions
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default AdminApplicationDetailsPage;
