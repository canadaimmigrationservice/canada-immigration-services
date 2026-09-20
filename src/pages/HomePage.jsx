import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getVisibleVisaServices } from "../services/visaService";
import { getWebsiteContent } from "../services/websiteService";

const defaultHero = {
  eyebrow: "Canada Immigration Services",
  title: "Immigration and visa services for your journey to Canada",
  description:
    "Access immigration information, submit an application, and securely check the progress of your application online."
};

function HomePage() {
  const [visaServices, setVisaServices] = useState([]);
  const [hero, setHero] = useState(defaultHero);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHomepage() {
      try {
        const [services, heroContent] = await Promise.all([
          getVisibleVisaServices(),
          getWebsiteContent("homepage_hero")
        ]);

        setVisaServices(services);

        if (heroContent && typeof heroContent === "object") {
          setHero({
            ...defaultHero,
            ...heroContent
          });
        }
      } catch (requestError) {
        console.error(requestError);
        setError(
          "Some website information could not be loaded. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomepage();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">{hero.eyebrow}</span>

            <h1>{hero.title}</h1>

            <p>{hero.description}</p>

            <div className="hero-actions">
              <Link to="/apply" className="btn btn-primary">
                Apply for Visa
              </Link>

              <Link
                to="/check-application"
                className="btn btn-outline"
              >
                Check Your Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="container">
          <ErrorMessage message={error} />
        </div>
      )}

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Services</span>
            <h2>Immigration and visa services</h2>
            <p>
              Explore the available immigration and visa application
              services.
            </p>
          </div>

          {loading ? (
            <Loading message="Loading available services..." />
          ) : visaServices.length > 0 ? (
            <div className="card-grid">
              {visaServices.map((service) => (
                <article className="card" key={service.id}>
                  <h3>{service.name}</h3>

                  <p>
                    {service.short_description ||
                      service.description ||
                      "Learn more about this immigration or visa service."}
                  </p>

                  <Link
                    to={`/visa-services/${service.slug}`}
                    className="text-link"
                  >
                    Learn more
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No services are currently available</h3>
              <p>
                Please check back later for available immigration and
                visa services.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Application Process</span>
            <h2>How the application process works</h2>
          </div>

          <div className="process-grid">
            <div className="process-step">
              <span className="process-number">1</span>
              <h3>Submit your application</h3>
              <p>
                Provide the requested information and supporting
                documents.
              </p>
            </div>

            <div className="process-step">
              <span className="process-number">2</span>
              <h3>Application review</h3>
              <p>
                Your submitted information is reviewed and processed.
              </p>
            </div>

            <div className="process-step">
              <span className="process-number">3</span>
              <h3>Check your application</h3>
              <p>
                Use your assigned Application Number to view
                authorized application information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-box">
          <div>
            <span className="eyebrow">Ready to Apply?</span>
            <h2>Start your application</h2>
            <p>
              Submit your application online and keep your Application
              Number available for future checks.
            </p>
          </div>

          <Link to="/apply" className="btn btn-primary">
            Apply for Visa
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
