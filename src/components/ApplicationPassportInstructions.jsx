function ApplicationPassportInstructions({ application }) {
  if (
    !application ||
    !application.passport_submission_visible ||
    !application.passport_instructions
  ) {
    return null;
  }

  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Passport Submission</span>
        <h2>Passport Submission Instructions</h2>
        <p>
          Please review the instructions provided for your application.
        </p>
      </div>

      <div className="passport-instructions">
        <p>{application.passport_instructions}</p>
      </div>
    </section>
  );
}

export default ApplicationPassportInstructions;
