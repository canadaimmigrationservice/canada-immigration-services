import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import {
  getVisibleVisaServices
} from "../services/visaService";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  visa_services_title:
    "Canadian Visa and Immigration Services",
  visa_services_description:
    "Explore our available Canadian visa and immigration services and choose the service that matches your application needs."
};

function VisaServicesPage() {
  const [services, setServices] =
    useState([]);

  const [settings, setSettings] =
    useState(DEFAULT_CONTENT);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      try {
        const [
          websiteSettings,
          visaServices
        ] = await Promise.all([
          getPublicWebsiteSettings(),
          getVisibleVisaServices()
        ]);

        if (!mounted) return;

        setSettings({
          ...DEFAULT_CONTENT,
          ...settingsToObject(
            websiteSettings
          )
        });

        setServices(visaServices);
      } catch (loadError) {
        console.error(
          "Unable to load visa services:",
          loadError
        );

        if (mounted) {
          setError(
            "Visa services could not be loaded at this time."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <Loading message="Loading visa services..." />
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        {error && (
          <AlertMessage
            type="error"
            title="Visa Services"
            message={error}
          />
        )}

        <div className="section-heading">
          <span className="eyebrow">
            Visa Services
          </span>

          <h1>
            {settings.visa_services_title}
          </h1>

          <p>
            {settings.visa_services_description}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <h2>
              No services are currently available
            </h2>

            <p>
              Please check back later for available
              Canadian immigration services.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {services.map((service) => (
              <article
                className="card"
                key={service.id}
              >
                <span className="eyebrow">
                  Visa Service
                </span>

                <h2>
                  {service.name}
                </h2>

                <p>
                  {service.short_description ||
                    "Learn more about this Canadian immigration service."}
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
