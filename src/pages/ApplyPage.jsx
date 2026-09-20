import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import { getVisibleVisaServices } from "../services/visaService";
import { validateApplication } from "../lib/validation";
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from "../lib/constants";

const initialForm = {
  full_name: "",
  surname: "",
  date_of_birth: "",
  gender: "",
  nationality: "",
  country_of_origin: "",
  email: "",
  phone: "",
  residential_address: "",
  occupation: "",
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  visa_type: "",
  work_permit_type: "",
  destination_country: "Canada",
  country_of_processing: "",
  application_date: new Date().toISOString().split("T")[0],
  services_requested: []
};

function ApplyPage() {
  const [formData, setFormData] = useState(initialForm);
  const [visaServices, setVisaServices] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: ""
    }));
  }

  function handleServiceChange(event) {
    const { value, checked } = event.target;

    setFormData((current) => {
      const services = checked
        ? [...current.services_requested, value]
        : current.services_requested.filter(
            (service) => service !== value
          );

      return {
        ...current,
        services_requested: services
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");
    setSubmitted(false);

    const validation = validateApplication(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Application submission will be connected to the secure
       * server-side submission endpoint after the application
       * security layer and Edge Function are completed.
       */

      console.log("Application ready for secure submission:", formData);

      setSubmitted(true);
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      console.error(error);

      setSubmitError(
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
            information. Submission of an application does not
            constitute approval.
          </p>
        </div>

        {loadingServices ? (
          <Loading message="Loading application options..." />
        ) : (
          <form onSubmit={handleSubmit} className="application-form">
            {submitError && (
              <ErrorMessage message={submitError} />
            )}

            {submitted && (
              <AlertMessage
                type="success"
                title="Application Submitted"
                message="Your application information has been received. An Application Number will be assigned by the administration."
              />
            )}

            <section className="card">
              <div className="section-heading">
                <span className="eyebrow">Personal Information</span>
                <h2>Applicant Details</h2>
              </div>

              <div className="form-grid">
                <FormField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />

                <FormField
                  label="Surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  placeholder="Enter your surname"
                />

                <FormField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />

                <FormField
                  label="Gender"
                  name="gender"
                  type="select"
                  value={formData.gender}
                  onChange={handleChange}
                  options={GENDER_OPTIONS}
                />

                <FormField
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  placeholder="Enter your nationality"
                />

                <FormField
                  label="Country of Origin"
                  name="country_of_origin"
                  type="select"
                  value={formData.country_of_origin}
                  onChange={handleChange}
                  options={COUNTRY_OPTIONS}
                  required
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />

                <FormField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />

                <FormField
                  label="Residential Address"
                  name="residential_address"
                  type="textarea"
                  value={formData.residential_address}
                  onChange={handleChange}
                  placeholder="Enter your residential address"
                />

                <FormField
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Enter your occupation"
                />
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <span className="eyebrow">Passport</span>
                <h2>Passport Details</h2>
              </div>

              <div className="form-grid">
                <FormField
                  label="Passport Number"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  placeholder="Enter your passport number"
                />

                <FormField
                  label="Passport Issue Date"
                  name="passport_issue_date"
                  type="date"
                  value={formData.passport_issue_date}
                  onChange={handleChange}
                />

                <FormField
                  label="Passport Expiry Date"
                  name="passport_expiry_date"
                  type="date"
                  value={formData.passport_expiry_date}
                  onChange={handleChange}
                />
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <span className="eyebrow">Application</span>
                <h2>Application Details</h2>
              </div>

              <div className="form-grid">
                <FormField
                  label="Visa Type"
                  name="visa_type"
                  type="select"
                  value={formData.visa_type}
                  onChange={handleChange}
                  options={visaServices.map((service) => ({
                    value: service.name,
                    label: service.name
                  }))}
                  required
                />

                <FormField
                  label="Work Permit Type"
                  name="work_permit_type"
                  value={formData.work_permit_type}
                  onChange={handleChange}
                  placeholder="Enter work permit type if applicable"
                />

                <FormField
                  label="Destination Country"
                  name="destination_country"
                  type="select"
                  value={formData.destination_country}
                  onChange={handleChange}
                  options={COUNTRY_OPTIONS}
                  required
                />

                <FormField
                  label="Country of Processing"
                  name="country_of_processing"
                  type="select"
                  value={formData.country_of_processing}
                  onChange={handleChange}
                  options={COUNTRY_OPTIONS}
                  required
                />

                <FormField
                  label="Application Date"
                  name="application_date"
                  type="date"
                  value={formData.application_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Services Requested</label>

                <div className="checkbox-list">
                  {visaServices.map((service) => (
                    <label
                      className="checkbox-item"
                      key={service.id}
                    >
                      <input
                        type="checkbox"
                        value={service.name}
                        checked={formData.services_requested.includes(
                          service.name
                        )}
                        onChange={handleServiceChange}
                      />

                      <span>{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {Object.keys(errors).length > 0 && (
              <AlertMessage
                type="error"
                title="Please review your application"
                message="Some required information is missing or invalid."
              />
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default ApplyPage;
