import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import { getVisibleVisaServices } from "../services/visaService";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  site_name: "Canada Immigration Services",
  homepage_hero_title:
    "Your Journey to Canada Starts Here",
  homepage_hero_description:
    "Professional immigration and visa application services designed to help applicants navigate the Canadian immigration process.",
  homepage_hero_button_text:
    "Apply for Visa",
  homepage_about_title:
    "Canada Immigration Services",
  homepage_about_description:
    "We provide information and application support for individuals seeking Canadian visa and immigration services.",
  homepage_process_title:
    "Our Application Process",
  homepage_process_description:
    "Follow these simple steps to begin your application.",
  homepage_cta_title:
    "Ready to Begin Your Application?",
  homepage_cta_description:
    "Submit your application and provide the information required for processing."
};

function HomePage() {
  const [settings, setSettings] =
    useState(DEFAULT_CONTENT);

  const [visaServices, setVisaServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHomepage() {
      setLoading(true);
      setError("");

      try {
        const [
          websiteSettings,
          services
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

        setVisaServices(services);
      } catch (loadError) {
        console.error(
          "Unable to load homepage content:",
          loadError
        );

        if (mounted) {
          setError(
            "Some website content could not be loaded. Please try again later."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHomepage();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <Loading message="Loading website..." />
        </div>
      </main>
    );
  }

  return (
    <main>
      {error && (
        <div className="container">
          <AlertMessage
            type="error"
            title="Website content"
            message={error}
          />
        </div>
      )}

      <section className="hero-section">
        <div className="container hero-content">
          <span className="eyebrow">
            {settings.site_name}
          </span>

          <h1>
            {settings.homepage_hero_title}
          </h1>

          <p>
            {settings.homepage_hero_description}
          </p>

          <div className="hero-actions">
            <Link
              to="/apply"
              className="btn btn-primary"
            >
              {settings.homepage_hero_button_text}
            </Link>

            <Link
              to="/check-application"
              className="btn btn-outline"
            >
              Check Your Application
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">
              About Us
            </span>

            <h2>
              {settings.homepage_about_title}
            </h2>

            <p>
              {settings.homepage_about_description}
            </p>
          </div>

          <div className="form-actions">
            <Link
              to="/about"
              className="btn btn-outline"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">
              Visa Services
            </span>

            <h2>
              Explore Our Services
            </h2>

            <p>
              Choose the immigration or visa service
              that matches your application needs.
            </p>
          </div>

          {visaServices.length === 0 ? (
            <div className="empty-state">
              <h3>
                Services currently unavailable
              </h3>

              <p>
                Please check back later for available
                immigration services.
              </p>
            </div>
          ) : (
            <div className="card-grid">
              {visaServices
                .slice(0, 6)
                .map((service) => (
                  <article
                    className="card"
                    key={service.id}
                  >
                    <h3>
                      {service.name}
                    </h3>

                    <p>
                      {service.short_description ||
                        "Learn more about this immigration service."}
                    </p>

                    <Link
                      to={`/visa-services/${service.slug}`}
                      className="btn btn-outline"
                    >
                      Learn More
                    </Link>
                  </article>
                ))}
            </div>
          )}

          <div className="form-actions">
            <Link
              to="/visa-services"
              className="btn btn-primary"
            >
              View All Visa Services
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">
              Process
            </span>

            <h2>
              {settings.homepage_process_title}
            </h2>

            <p>
              {settings.homepage_process_description}
            </p>
          </div>

          <div className="card-grid">
            <article className="card">
              <span className="eyebrow">
                Step 1
              </span>

              <h3>
                Choose Your Service
              </h3>

              <p>
                Review the available visa and
                immigration services and select the
                appropriate option.
              </p>
            </article>

            <article className="card">
              <span className="eyebrow">
                Step 2
              </span>

              <h3>
                Submit Your Application
              </h3>

              <p>
                Complete the application form and
                provide the requested information and
                supporting documents.
              </p>
            </article>

            <article className="card">
              <span className="eyebrow">
                Step 3
              </span>

              <h3>
                Track Your Application
              </h3>

              <p>
                Use your assigned Application Number
                to check available application
                information and updates.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="cta-section">
            <div>
              <span className="eyebrow">
                Start Today
              </span>

              <h2>
                {settings.homepage_cta_title}
              </h2>

              <p>
                {settings.homepage_cta_description}
              </p>
            </div>

            <Link
              to="/apply"
              className="btn btn-primary"
            >
              Apply for Visa
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
