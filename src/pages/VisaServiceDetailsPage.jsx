import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getVisaServiceBySlug } from "../services/visaService";

function VisaServiceDetailsPage() {
  const { slug } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const data = await getVisaServiceBySlug(slug);

        if (!data) {
          setError("The requested visa service could not be found.");
          return;
        }

        setService(data);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "We could not load this visa service. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [slug]);

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <Loading message="Loading visa service..." />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="container">
          <ErrorMessage message={error} />

          <div className="form-actions">
            <Link to="/visa-services" className="btn btn-outline">
              Back to Visa Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Visa Services</span>

          <h1>{service.name}</h1>

          {service.short_description && (
            <p>{service.short_description}</p>
          )}
        </div>

        <section className="card service-details">
          {service.description ? (
            <div className="service-description">
              {service.description.split("\n").map((paragraph, index) =>
                paragraph.trim() ? (
                  <p key={index}>{paragraph}</p>
                ) : null
              )}
            </div>
          ) : (
            <p>
              Detailed information about this service is currently
              being prepared.
            </p>
          )}

          <div className="form-actions">
            <Link to="/apply" className="btn btn-primary">
              Apply for Visa
            </Link>

            <Link
              to="/visa-services"
              className="btn btn-outline"
            >
              Back to Visa Services
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default VisaServiceDetailsPage;
