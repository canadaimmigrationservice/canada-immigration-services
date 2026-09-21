import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import { getVisaServiceBySlug } from "../services/visaService";

function VisaServiceDetailsPage() {
  const { slug } = useParams();

  const [service, setService] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadService() {
      setLoading(true);
      setError("");

      try {
        const result =
          await getVisaServiceBySlug(slug);

        if (!mounted) return;

        if (!result) {
          setError(
            "The requested visa service could not be found."
          );
          return;
        }

        setService(result);
      } catch (loadError) {
        console.error(
          "Unable to load visa service:",
          loadError
        );

        if (mounted) {
          setError(
            "The visa service could not be loaded at this time."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadService();

    return () => {
      mounted = false;
    };
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

  if (error || !service) {
    return (
      <main className="section">
        <div className="container">
          <AlertMessage
            type="error"
            title="Visa Service"
            message={
              error ||
              "The requested visa service could not be found."
            }
          />

          <div className="form-actions">
            <Link
              to="/visa-services"
              className="btn btn-outline"
            >
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
          <span className="eyebrow">
            Visa Service
          </span>

          <h1>{service.name}</h1>

          {service.short_description && (
            <p>
              {service.short_description}
            </p>
          )}
        </div>

        <div className="card-grid">
          <article className="card">
            <h2>Service Information</h2>

            <p>
              {service.description ||
                "Information about this immigration service is currently unavailable."}
            </p>
          </article>

          <article className="card">
            <h2>Requirements</h2>

            <p>
              {service.requirements ||
                "Requirements for this service will be provided during the application process."}
            </p>
          </article>

          <article className="card">
            <h2>Processing Time</h2>

            <p>
              {service.processing_time ||
                "Processing time information is currently unavailable."}
            </p>
          </article>
        </div>

        <div className="form-actions">
          <Link
            to="/apply"
            className="btn btn-primary"
          >
            Apply for This Service
          </Link>

          <Link
            to="/visa-services"
            className="btn btn-outline"
          >
            Back to Visa Services
          </Link>
        </div>
      </div>
    </main>
  );
}

export default VisaServiceDetailsPage;
