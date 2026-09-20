import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AlertMessage from "../components/AlertMessage";
import ApplicationForm from "../components/ApplicationForm";
import { getVisibleVisaServices } from "../services/visaService";
import { createApplication } from "../services/applicationService";
import { saveApplicantDocument } from "../services/documentService";

function ApplyPage() {
  const [visaServices, setVisaServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApplication, setSubmittedApplication] =
    useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const services = await getVisibleVisaServices();
        setVisaServices(services);
      } catch (error) {
        console.error(error);

        setSubmitError(
          "We could not load the available services. Please try again later."
        );
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  async function handleSubmit({ formData, documents }) {
    setSubmitError("");
    setSubmittedApplication(null);
    setSubmitting(true);

    try {
      const application = await createApplication(formData);

      if (documents.length > 0) {
        for (const file of documents) {
          await saveApplicantDocument(application.id, {
            file
          });
        }
      }

      setSubmittedApplication(application);
    } catch (error) {
      console.error(error);

      setSubmitError(
        error?.message ||
          "Your application could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Apply for Visa</span>

          <h1>Submit Your Application</h1>

          <p>
            Complete the application form with the requested
            information and supporting documents. Submission of an
            application does not constitute approval.
          </p>
        </div>

        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        {submittedApplication && (
          <AlertMessage
            type="success"
            title="Application Received"
            message={
              submittedApplication.application_number
                ? `Your application has been received. Your Application Number is ${submittedApplication.application_number}.`
                : "Your application has been received. An Application Number will be assigned by the administration."
            }
          />
        )}

        {loadingServices ? (
          <Loading message="Loading application options..." />
        ) : visaServices.length === 0 ? (
          <div className="card">
            <AlertMessage
              type="info"
              title="Applications are temporarily unavailable"
              message="No application services are currently available. Please try again later."
            />
          </div>
        ) : (
          <ApplicationForm
            visaServices={visaServices}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        <div className="form-actions">
          <Link
            to="/check-application"
            className="btn btn-outline"
          >
            Check Your Application
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ApplyPage;
