import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getWebsiteContent } from "../services/websiteService";

const defaultAbout = {
  title: "About Canada Immigration Services",
  description:
    "Learn more about Canada Immigration Services and the immigration and visa services available through this website.",
  sections: []
};

function AboutPage() {
  const [about, setAbout] = useState(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAboutContent() {
      try {
        const content = await getWebsiteContent("about_page");

        if (content && typeof content === "object") {
          setAbout({
            ...defaultAbout,
            ...content
          });
        }
      } catch (requestError) {
        console.error(requestError);
        setError(
          "Some information could not be loaded. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAboutContent();
  }, []);

  return (
    <main className="section">
      <div className="container">
        {loading ? (
          <Loading message="Loading information..." />
        ) : (
          <>
            {error && <ErrorMessage message={error} />}

            <div className="section-heading">
              <span className="eyebrow">About</span>
              <h1>{about.title}</h1>
              <p>{about.description}</p>
            </div>

            {Array.isArray(about.sections) &&
              about.sections.length > 0 && (
                <div className="content-stack">
                  {about.sections.map((section, index) => (
                    <section className="card" key={index}>
                      {section.title && <h2>{section.title}</h2>}

                      {section.content &&
                        section.content.split("\n").map(
                          (paragraph, paragraphIndex) =>
                            paragraph.trim() ? (
                              <p key={paragraphIndex}>
                                {paragraph}
                              </p>
                            ) : null
                        )}
                    </section>
                  ))}
                </div>
              )}
          </>
        )}
      </div>
    </main>
  );
}

export default AboutPage;
