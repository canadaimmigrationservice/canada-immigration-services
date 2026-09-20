import { formatFileSize } from "../lib/formatters";

function ApplicationDocuments({ documents = [] }) {
  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Documents</span>
        <h2>Applicant Documents</h2>
      </div>

      {documents.length === 0 ? (
        <p>No applicant documents are currently available.</p>
      ) : (
        <div className="document-list">
          {documents.map((document) => (
            <div className="document-item" key={document.id}>
              <div>
                <strong>{document.file_name}</strong>

                <div className="document-meta">
                  <span>{document.file_type || "Unknown file type"}</span>
                  <span>{formatFileSize(document.file_size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ApplicationDocuments;
