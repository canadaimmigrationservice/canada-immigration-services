export function isValidEmail(email) {
  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone) {
  if (!phone) {
    return false;
  }

  return /^[+\d][\d\s().-]{6,}$/.test(phone.trim());
}

export function isValidDate(dateValue) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  return !Number.isNaN(date.getTime());
}

export function validateRequired(value) {
  return typeof value === "string"
    ? value.trim().length > 0
    : Boolean(value);
}

export function validateApplication(formData) {
  const errors = {};

  const requiredFields = [
    ["full_name", "Full Name"],
    ["surname", "Surname"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["nationality", "Nationality"],
    ["country_of_origin", "Country of Origin"],
    ["visa_type", "Visa Type"],
    ["destination_country", "Destination Country"],
    ["country_of_processing", "Country of Processing"]
  ];

  requiredFields.forEach(([field, label]) => {
    if (!validateRequired(formData[field])) {
      errors[field] = `${label} is required.`;
    }
  });

  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (
    formData.passport_issue_date &&
    !isValidDate(formData.passport_issue_date)
  ) {
    errors.passport_issue_date = "Please enter a valid passport issue date.";
  }

  if (
    formData.passport_expiry_date &&
    !isValidDate(formData.passport_expiry_date)
  ) {
    errors.passport_expiry_date =
      "Please enter a valid passport expiry date.";
  }

  if (
    formData.date_of_birth &&
    !isValidDate(formData.date_of_birth)
  ) {
    errors.date_of_birth = "Please enter a valid date of birth.";
  }

  if (
    formData.application_date &&
    !isValidDate(formData.application_date)
  ) {
    errors.application_date = "Please enter a valid application date.";
  }

  if (
    formData.passport_issue_date &&
    formData.passport_expiry_date &&
    new Date(formData.passport_expiry_date) <=
      new Date(formData.passport_issue_date)
  ) {
    errors.passport_expiry_date =
      "Passport expiry date must be after the issue date.";
  }

  if (
    formData.services_requested &&
    !Array.isArray(formData.services_requested)
  ) {
    errors.services_requested = "Invalid services selection.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDocument(file, maxSize, allowedTypes) {
  if (!file) {
    return {
      isValid: false,
      error: "Please select a file."
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "The selected file is too large."
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "This file type is not supported."
    };
  }

  return {
    isValid: true,
    error: ""
  };
}
