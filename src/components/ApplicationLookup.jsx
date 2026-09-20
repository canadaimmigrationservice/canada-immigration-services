import { useState } from "react";
import AlertMessage from "./AlertMessage";
import Loading from "./Loading";

function ApplicationLookup({
  onSearch,
  loading = false,
  error = "",
  initialValue = ""
}) {
  const [applicationNumber, setApplicationNumber] =
    useState(initialValue);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedNumber = applicationNumber.trim();

    if (!normalizedNumber || loading) {
      return;
    }

    await onSearch(normalizedNumber);
  }

  return (
    <section className="lookup-box">
      <div className="section-heading">
        <span className="eyebrow">Application Status</span>
        <h1>Check Your Application</h1>
        <p>
          Enter your Application Number to check the information
          authorized for your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="form-group">
          <label htmlFor="application-number">
            Application Number
          </label>

          <input
            id="application-number"
            name="applicationNumber"
            type="text"
            value={applicationNumber}
            onChange={(event) =>
              setApplicationNumber(event.target.value)
            }
            placeholder="Enter your Application Number"
            autoComplete="off"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !applicationNumber.trim()}
        >
          {loading ? "Checking..." : "Check Application"}
        </button>
      </form>

      {loading && (
        <Loading message="Checking your application..." />
      )}

      {error && (
        <AlertMessage
          type="error"
          title="Application Not Found"
          message={error}
        />
      )}
    </section>
  );
}

export default ApplicationLookup;
