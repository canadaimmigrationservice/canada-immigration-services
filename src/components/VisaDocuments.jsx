import { formatFileSize } from "../lib/formatters";

function VisaDocuments({ documents = [] }) {
  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Documents</span>
        <h2>Visa Documents</h2>
        <p>
          Documents made available to you by the administration.
        </p>
      </div>

      {documents.length === 0 ? (
        <p>No visa documents are currently available.</p>
      ) : (
        <div className="document-list">
          {documents.map((document) => (
            <article className="document-item" key={document.id}>
              <div>
                <strong>{document.title || document.file_name}</strong>

                {document.description && (
                  <p>{document.description}</p>
                )}

                <div className="document-meta">
                  <span>
                    {document.file_type || "Unknown file type"}
                  </span>

                  <span>
                    {formatFileSize(document.file_size)}
                  </span>
                </div>
              </div>

              <span className="status-badge status-success">
                Available
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default VisaDocuments;
