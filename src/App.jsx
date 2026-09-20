import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PagePlaceholder from "./components/PagePlaceholder";

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">Canada Immigration Services</span>

            <h1>
              Immigration and visa services for your journey to Canada
            </h1>

            <p>
              Access immigration information, submit an application, and
              securely check the progress of your application online.
            </p>

            <div className="hero-actions">
              <a href="/apply" className="btn btn-primary">
                Apply for Visa
              </a>

              <a
                href="/check-application"
                className="btn btn-outline"
              >
                Check Your Application
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Services</span>
            <h2>Immigration and visa services</h2>
            <p>
              Explore the available immigration and visa application services.
            </p>
          </div>

          <div className="card-grid">
            <article className="card">
              <h3>Visitor Visa</h3>
              <p>
                Services for eligible visitors travelling to Canada.
              </p>
            </article>

            <article className="card">
              <h3>Student Visa</h3>
              <p>
                Services for applicants planning to study in Canada.
              </p>
            </article>

            <article className="card">
              <h3>Work Permit</h3>
              <p>
                Services for eligible applicants seeking authorization to work
                in Canada.
              </p>
            </article>

            <article className="card">
              <h3>Permanent Residence</h3>
              <p>
                Immigration application services for permanent residence.
              </p>
            </article>
          </div>
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
                Provide the requested information and supporting documents.
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
                Use your assigned Application Number to view authorized
                application information.
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
              Submit your application online and keep your Application Number
              available for future checks.
            </p>
          </div>

          <a href="/apply" className="btn btn-primary">
            Apply for Visa
          </a>
        </div>
      </section>
    </main>
  );
}

function About() {
  return (
    <PagePlaceholder
      title="About"
      description="Learn more about Canada Immigration Services."
    />
  );
}

function VisaServices() {
  return (
    <PagePlaceholder
      title="Visa Services"
      description="Explore available immigration and visa services."
    />
  );
}

function Apply() {
  return (
    <PagePlaceholder
      title="Apply for Visa"
      description="Submit your immigration or visa application online."
    />
  );
}

function CheckApplication() {
  return (
    <PagePlaceholder
      title="Check Your Application"
      description="Check your application using your Application Number."
    />
  );
}

function Contact() {
  return (
    <PagePlaceholder
      title="Contact"
      description="Contact Canada Immigration Services."
    />
  );
}

function NotFound() {
  return (
    <PagePlaceholder
      title="Page Not Found"
      description="The page you are looking for could not be found."
    />
  );
}

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/visa-services" element={<VisaServices />} />
        <Route path="/apply" element={<Apply />} />
        <Route
          path="/check-application"
          element={<CheckApplication />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
