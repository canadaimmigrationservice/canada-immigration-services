import StatusBadge from "./StatusBadge";

function DecisionSection({ application }) {
  if (!application) {
    return null;
  }

  const decision = application.decision_status || "Pending";
  const message = application.decision_message;

  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Decision</span>
        <h2>Application Decision</h2>
      </div>

      <div className="decision-summary">
        <div className="status-item">
          <span className="status-label">Decision</span>
          <StatusBadge status={decision} />
        </div>
      </div>

      {message && (
        <div className="decision-message">
          <h3>Additional Information</h3>
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}

export default DecisionSection;
