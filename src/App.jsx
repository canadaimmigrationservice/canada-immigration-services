import { NavLink, Route, Routes } from "react-router-dom";

function Header() {
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Visa Services", path: "/visa-services" },
    { label: "Apply for Visa", path: "/apply" },
    { label: "Check Your Application", path: "/check-application" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="site-logo">
          Canada Immigration Services
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>Canada Immigration Services</strong>
          <p>
            Immigration and visa application services.
          </p>
        </div>

        <div className="footer-links">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/visa-services">Visa Services</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} Canada Immigration Services. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

function PagePlaceholder({ title, description }) {
  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </main>
  );
}

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
              <NavLink to="/apply" className="btn btn-primary">
                Apply for Visa
              </NavLink>

              <NavLink to="/check-application" className="btn btn-outline">
                Check Your Application
              </NavLink>
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

          <NavLink to="/apply" className="btn btn-primary">
            Apply for Visa
          </NavLink>
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
