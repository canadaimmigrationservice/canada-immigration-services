import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getVisibleVisaServices } from "../services/visaService";

function VisaServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getVisibleVisaServices();
        setServices(data);
      } catch (requestError) {
        console.error(requestError);
        setError(
          "We could not load the available visa services. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Visa Services</span>
          <h1>Immigration and Visa Services</h1>
          <p>
            Explore the immigration and visa services currently
            available.
          </p>
        </div>

        {loading && (
          <Loading message="Loading visa services..." />
        )}

        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && services.length === 0 && (
          <EmptyState
            title="No services available"
            message="There are currently no visa services available."
          />
        )}

        {!loading && !error && services.length > 0 && (
          <div className="card-grid">
            {services.map((service) => (
              <article className="card" key={service.id}>
                <h2>{service.name}</h2>

                <p>
                  {service.short_description ||
                    service.description ||
                    "Learn more about this service."}
                </p>

                <Link
                  to={`/visa-services/${service.slug}`}
                  className="btn btn-outline"
                >
                  View Service
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default VisaServicesPage;
