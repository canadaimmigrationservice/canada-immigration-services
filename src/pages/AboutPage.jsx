import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  about_title: "About Canada Immigration Services",
  about_description:
    "Canada Immigration Services provides information and application support for individuals seeking Canadian visa and immigration services.",
  about_mission_title: "Our Mission",
  about_mission_description:
    "Our mission is to provide clear information and organized application support throughout the immigration process.",
  about_approach_title: "Our Approach",
  about_approach_description:
    "We focus on providing applicants with accessible information, structured application processes, and clear application updates."
};

function AboutPage() {
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
          "Unable to load About page settings:",
          loadError
        );

        if (mounted) {
          setError(
            "Some About page content could not be loaded."
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
          <Loading message="Loading About page..." />
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
            title="About page"
            message={error}
          />
        )}

        <div className="section-heading">
          <span className="eyebrow">
            About Us
          </span>

          <h1>
            {settings.about_title}
          </h1>

          <p>
            {settings.about_description}
          </p>
        </div>

        <div className="card-grid">
          <article className="card">
            <span className="eyebrow">
              Our Mission
            </span>

            <h2>
              {settings.about_mission_title}
            </h2>

            <p>
              {settings.about_mission_description}
            </p>
          </article>

          <article className="card">
            <span className="eyebrow">
              Our Approach
            </span>

            <h2>
              {settings.about_approach_title}
            </h2>

            <p>
              {settings.about_approach_description}
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}

export default AboutPage;
