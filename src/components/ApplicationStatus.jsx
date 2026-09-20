import StatusBadge from "./StatusBadge";

function ApplicationStatus({ application }) {
  if (!application) {
    return null;
  }

  const statuses = [
    {
      label: "Application Status",
      value: application.application_status
    },
    {
      label: "Eligibility",
      value: application.eligibility_status
    },
    {
      label: "Background Check",
      value: application.background_check_status
    },
    {
      label: "Biometrics",
      value: application.biometrics_status
    },
    {
      label: "Medical",
      value: application.medical_status
    },
    {
      label: "Additional Documents",
      value: application.additional_documents_status
    },
    {
      label: "Decision",
      value: application.decision_status
    }
  ];

  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Application Progress</span>
        <h2>Application Status</h2>
      </div>

      <div className="status-grid">
        {statuses.map((item) => (
          <div className="status-item" key={item.label}>
            <span className="status-label">{item.label}</span>
            <StatusBadge status={item.value} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ApplicationStatus;
