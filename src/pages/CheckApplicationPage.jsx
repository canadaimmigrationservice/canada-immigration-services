import { useEffect, useState } from "react";
import ApplicationLookup from "../components/ApplicationLookup";
import ApplicationDetails from "../components/ApplicationDetails";
import ApplicationStatus from "../components/ApplicationStatus";
import ApplicationMessages from "../components/ApplicationMessages";
import ApplicationDocuments from "../components/ApplicationDocuments";
import VisaDocuments from "../components/VisaDocuments";
import ApplicationPassportInstructions from "../components/ApplicationPassportInstructions";
import DecisionSection from "../components/DecisionSection";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import { getApplicationByNumber } from "../services/applicationService";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  check_application_title:
    "Check Your Application",
  check_application_description:
    "Enter your Application Number to check the information authorized for your application."
};

function CheckApplicationPage() {
  const [application, setApplication] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [applicantDocuments, setApplicantDocuments] =
    useState([]);

  const [visaDocuments, setVisaDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [error, setError] =
    useState("");

  const [settings, setSettings] =
    useState(DEFAULT_CONTENT);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const websiteSettings =
          await getPublicWebsiteSettings();

        if (!mounted) return;

        setSettings({
          ...DEFAULT_CONTENT,
          ...settingsToObject(
            websiteSettings
          )
        });
      } catch (settingsError) {
        console.error(
          "Unable to load application check settings:",
          settingsError
        );
      } finally {
        if (mounted) {
          setLoadingSettings(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSearch(
    applicationNumber
  ) {
    setLoading(true);
    setError("");
    setApplication(null);
    setMessages([]);
    setApplicantDocuments([]);
    setVisaDocuments([]);

    try {
      const result =
        await getApplicationByNumber(
          applicationNumber
        );

      if (!result) {
        setError(
          "No application was found with the Application Number provided."
        );
        return;
      }

      setApplication(result);
      setMessages(
        result.messages || []
      );
      setApplicantDocuments(
        result.applicant_documents || []
      );
      setVisaDocuments(
        result.visa_documents || []
      );
    } catch (requestError) {
      console.error(
        "Unable to check application:",
        requestError
      );

      setError(
        "We could not check your application at this time. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingSettings) {
    return (
      <main className="section">
        <div className="container">
          <Loading message="Loading application check..." />
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">
            Application Status
          </span>

          <h1>
            {settings.check_application_title}
          </h1>

          <p>
            {settings.check_application_description}
          </p>
        </div>

        <ApplicationLookup
          onSearch={handleSearch}
          loading={loading}
          error={error}
        />

        {application && (
          <div className="application-result">
            <ApplicationDetails
              application={application}
            />

            <ApplicationStatus
              application={application}
            />

            <DecisionSection
              application={application}
            />

            <ApplicationPassportInstructions
              application={application}
            />

            <ApplicationMessages
              messages={messages}
            />

            <ApplicationDocuments
              documents={applicantDocuments}
            />

            <VisaDocuments
              documents={visaDocuments}
            />
          </div>
        )}

        {!application && !loading && !error && (
          <AlertMessage
            type="info"
            title="Application Lookup"
            message="Enter your Application Number above to view available application information."
          />
        )}
      </div>
    </main>
  );
}

export default CheckApplicationPage;
