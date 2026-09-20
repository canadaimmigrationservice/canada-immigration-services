function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  options = [],
  disabled = false,
  helpText = ""
}) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-group">
      <label htmlFor={fieldId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {type === "select" ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          <option value="">Select {label}</option>

          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;

            const optionLabel =
              typeof option === "string" ? option : option.label;

            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={5}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}

      {helpText && <small>{helpText}</small>}
    </div>
  );
}

export default FormField;
