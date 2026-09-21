import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  contact_title:
    "Contact Canada Immigration Services",
  contact_description:
    "If you have questions about our immigration and visa application services, please contact us using the information below.",
  contact_email:
    "info@example.com",
  contact_phone:
    "",
  contact_address:
    "",
  contact_whatsapp:
    ""
};

function ContactPage() {
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
        const websiteSettings =
          await getPublicWebsiteSettings();

        if (!mounted) return;

        setSettings({
          ...DEFAULT_CONTENT,
          ...settingsToObject(
            websiteSettings
          )
        });
      } catch (loadError) {
        console.error(
          "Unable to load Contact page settings:",
          loadError
        );

        if (mounted) {
          setError(
            "Some contact information could not be loaded."
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
          <Loading message="Loading contact information..." />
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
            title="Contact information"
            message={error}
          />
        )}

        <div className="section-heading">
          <span className="eyebrow">
            Contact
          </span>

          <h1>
            {settings.contact_title}
          </h1>

          <p>
            {settings.contact_description}
          </p>
        </div>

        <div className="card-grid">
          <article className="card">
            <h2>Email</h2>

            {settings.contact_email ? (
              <p>
                <a
                  href={`mailto:${settings.contact_email}`}
                >
                  {settings.contact_email}
                </a>
              </p>
            ) : (
              <p>
                Email contact information is not
                currently available.
              </p>
            )}
          </article>

          <article className="card">
            <h2>Phone</h2>

            {settings.contact_phone ? (
              <p>
                <a
                  href={`tel:${settings.contact_phone}`}
                >
                  {settings.contact_phone}
                </a>
              </p>
            ) : (
              <p>
                Phone contact information is not
                currently available.
              </p>
            )}
          </article>

          <article className="card">
            <h2>Address</h2>

            <p>
              {settings.contact_address ||
                "Address information is not currently available."}
            </p>
          </article>

          <article className="card">
            <h2>WhatsApp</h2>

            {settings.contact_whatsapp ? (
              <p>
                <a
                  href={
                    settings.contact_whatsapp
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact us on WhatsApp
                </a>
              </p>
            ) : (
              <p>
                WhatsApp contact information is not
                currently available.
              </p>
            )}
          </article>
        </div>

        <div className="form-actions">
          <Link
            to="/apply"
            className="btn btn-primary"
          >
            Apply for Visa
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ContactPage;
