import { useState } from "react";
import FormField from "./FormField";
import DocumentUpload from "./DocumentUpload";
import AlertMessage from "./AlertMessage";
import {
  COUNTRY_OPTIONS,
  GENDER_OPTIONS
} from "../lib/constants";
import { validateApplication } from "../lib/validation";

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

function ApplicationForm({
  visaServices = [],
  onSubmit,
  submitting = false
}) {
  const [formData, setFormData] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

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

    setFormError("");

    const validation = validateApplication(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setFormError(
        "Please review the highlighted information before submitting your application."
      );
      return;
    }

    try {
      await onSubmit({
        formData,
        documents
      });
    } catch (error) {
      console.error(error);

      setFormError(
        "Your application could not be submitted. Please try again."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="application-form"
      noValidate
    >
      {formError && (
        <AlertMessage
          type="error"
          title="Application Error"
          message={formError}
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

      <section className="card">
        <div className="section-heading">
          <span className="eyebrow">Supporting Documents</span>
          <h2>Applicant Documents</h2>
          <p>
            You may upload supporting documents with your
            application.
          </p>
        </div>

        <DocumentUpload
          files={documents}
          onChange={setDocuments}
          disabled={submitting}
        />
      </section>

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
  );
}

export default ApplicationForm;
