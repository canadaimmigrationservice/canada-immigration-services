import { formatDate, formatList } from "../lib/formatters";

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || "—"}</span>
    </div>
  );
}

function ApplicationDetails({ application }) {
  if (!application) {
    return null;
  }

  return (
    <div className="details-grid">
      <section className="card">
        <div className="section-heading">
          <span className="eyebrow">Applicant</span>
          <h2>Applicant Details</h2>
        </div>

        <div className="detail-list">
          <DetailItem
            label="Full Name"
            value={`${application.full_name || ""} ${
              application.surname || ""
            }`.trim()}
          />
          <DetailItem
            label="Date of Birth"
            value={formatDate(application.date_of_birth)}
          />
          <DetailItem label="Gender" value={application.gender} />
          <DetailItem label="Nationality" value={application.nationality} />
          <DetailItem
            label="Country of Origin"
            value={application.country_of_origin}
          />
          <DetailItem label="Occupation" value={application.occupation} />
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <span className="eyebrow">Passport</span>
          <h2>Passport Details</h2>
        </div>

        <div className="detail-list">
          <DetailItem
            label="Passport Number"
            value={application.passport_number}
          />
          <DetailItem
            label="Issue Date"
            value={formatDate(application.passport_issue_date)}
          />
          <DetailItem
            label="Expiry Date"
            value={formatDate(application.passport_expiry_date)}
          />
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <span className="eyebrow">Application</span>
          <h2>Application Details</h2>
        </div>

        <div className="detail-list">
          <DetailItem
            label="Application Number"
            value={application.application_number}
          />
          <DetailItem label="Visa Type" value={application.visa_type} />
          <DetailItem
            label="Work Permit Type"
            value={application.work_permit_type}
          />
          <DetailItem
            label="Destination Country"
            value={application.destination_country}
          />
          <DetailItem
            label="Country of Processing"
            value={application.country_of_processing}
          />
          <DetailItem
            label="Application Date"
            value={formatDate(application.application_date)}
          />
          <DetailItem
            label="Services Requested"
            value={formatList(application.services_requested)}
          />
        </div>
      </section>
    </div>
  );
}

export default ApplicationDetails;
