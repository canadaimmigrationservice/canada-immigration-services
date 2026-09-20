import { useState } from "react";
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE
} from "../lib/constants";
import { validateDocument } from "../lib/validation";
import { formatFileSize } from "../lib/formatters";
import AlertMessage from "./AlertMessage";

function DocumentUpload({ files = [], onChange, disabled = false }) {
  const [error, setError] = useState("");

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      const validation = validateDocument(
        file,
        MAX_DOCUMENT_SIZE,
        ALLOWED_DOCUMENT_TYPES
      );

      if (!validation.isValid) {
        setError(
          `${file.name}: ${validation.error}`
        );
        event.target.value = "";
        return;
      }

      validFiles.push(file);
    }

    setError("");
    onChange([...files, ...validFiles]);

    event.target.value = "";
  }

  function removeFile(index) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className="form-group">
      <label htmlFor="applicant-documents">
        Supporting Documents
      </label>

      <input
        id="applicant-documents"
        name="applicantDocuments"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={handleFiles}
        disabled={disabled}
      />

      <small>
        You may select multiple documents. Maximum file size is{" "}
        {formatFileSize(MAX_DOCUMENT_SIZE)} per file.
      </small>

      {error && (
        <AlertMessage
          type="error"
          title="Document Upload Error"
          message={error}
        />
      )}

      {files.length > 0 && (
        <div className="document-list">
          {files.map((file, index) => (
            <div
              className="document-item"
              key={`${file.name}-${file.size}-${index}`}
            >
              <div>
                <strong>{file.name}</strong>

                <div className="document-meta">
                  <span>
                    {file.type || "Unknown file type"}
                  </span>

                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
