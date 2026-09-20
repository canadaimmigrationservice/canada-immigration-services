import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getWebsiteContent } from "../services/websiteService";

const defaultContact = {
  title: "Contact Canada Immigration Services",
  description:
    "Use the contact information below to get in touch with Canada Immigration Services.",
  email: "",
  phone: "",
  address: "",
  hours: ""
};

function ContactPage() {
  const [contact, setContact] = useState(defaultContact);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContactContent() {
      try {
        const content = await getWebsiteContent("contact_page");

        if (content && typeof content === "object") {
          setContact({
            ...defaultContact,
            ...content
          });
        }
      } catch (requestError) {
        console.error(requestError);
        setError(
          "Some contact information could not be loaded. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadContactContent();
  }, []);

  return (
    <main className="section">
      <div className="container">
        {loading ? (
          <Loading message="Loading contact information..." />
        ) : (
          <>
            {error && <ErrorMessage message={error} />}

            <div className="section-heading">
              <span className="eyebrow">Contact</span>
              <h1>{contact.title}</h1>
              <p>{contact.description}</p>
            </div>

            <div className="card-grid">
              {contact.email && (
                <article className="card">
                  <h2>Email</h2>
                  <p>{contact.email}</p>
                </article>
              )}

              {contact.phone && (
                <article className="card">
                  <h2>Phone</h2>
                  <p>{contact.phone}</p>
                </article>
              )}

              {contact.address && (
                <article className="card">
                  <h2>Address</h2>
                  <p>{contact.address}</p>
                </article>
              )}

              {contact.hours && (
                <article className="card">
                  <h2>Office Hours</h2>
                  <p>{contact.hours}</p>
                </article>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default ContactPage;
