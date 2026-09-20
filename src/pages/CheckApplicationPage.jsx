import { useState } from "react";
import ApplicationLookup from "../components/ApplicationLookup";
import ApplicationDetails from "../components/ApplicationDetails";
import ApplicationStatus from "../components/ApplicationStatus";
import ApplicationMessages from "../components/ApplicationMessages";
import ApplicationDocuments from "../components/ApplicationDocuments";
import VisaDocuments from "../components/VisaDocuments";
import ApplicationPassportInstructions from "../components/ApplicationPassportInstructions";
import DecisionSection from "../components/DecisionSection";
import { getApplicationByNumber } from "../services/applicationService";
import { getApplicantMessages } from "../services/messageService";
import { getApplicantDocuments } from "../services/documentService";
import { getVisibleVisaDocuments } from "../services/visaDocumentService";

function CheckApplicationPage() {
  const [application, setApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [applicantDocuments, setApplicantDocuments] = useState([]);
  const [visaDocuments, setVisaDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(applicationNumber) {
    setLoading(true);
    setError("");
    setApplication(null);
    setMessages([]);
    setApplicantDocuments([]);
    setVisaDocuments([]);

    try {
      const result = await getApplicationByNumber(applicationNumber);

      if (!result) {
        setError(
          "No application was found with the Application Number provided."
        );
        return;
      }

      setApplication(result);

      const [
        applicationMessages,
        applicationDocuments,
        availableVisaDocuments
      ] = await Promise.all([
        getApplicantMessages(result.id),
        getApplicantDocuments(result.id),
        getVisibleVisaDocuments(result.id)
      ]);

      setMessages(applicationMessages);
      setApplicantDocuments(applicationDocuments);
      setVisaDocuments(availableVisaDocuments);
    } catch (requestError) {
      console.error(requestError);

      setError(
        "We could not check your application at this time. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container">
        <ApplicationLookup
          onSearch={handleSearch}
          loading={loading}
          error={error}
        />

        {application && (
          <div className="application-result">
            <ApplicationDetails application={application} />

            <ApplicationStatus application={application} />

            <DecisionSection application={application} />

            <ApplicationPassportInstructions
              application={application}
            />

            <ApplicationMessages messages={messages} />

            <ApplicationDocuments
              documents={applicantDocuments}
            />

            <VisaDocuments documents={visaDocuments} />
          </div>
        )}
      </div>
    </main>
  );
}

export default CheckApplicationPage;
