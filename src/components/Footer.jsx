import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  site_name: "Canada Immigration Services",
  footer_description:
    "Visa and immigration application information and support.",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  footer_copyright:
    "All rights reserved."
};

function Footer() {
  const [settings, setSettings] =
    useState(DEFAULT_CONTENT);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
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
      } catch (error) {
        console.error(
          "Unable to load footer settings:",
          error
        );
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h2>{settings.site_name}</h2>

            <p>
              {settings.footer_description}
            </p>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>

            <Link to="/about">
              About
            </Link>

            <Link to="/visa-services">
              Visa Services
            </Link>

            <Link to="/apply">
              Apply for Visa
            </Link>

            <Link to="/check-application">
              Check Your Application
            </Link>

            <Link to="/contact">
              Contact
            </Link>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>

            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
              >
                {settings.contact_email}
              </a>
            )}

            {settings.contact_phone && (
              <a
                href={`tel:${settings.contact_phone}`}
              >
                {settings.contact_phone}
              </a>
            )}

            {settings.contact_address && (
              <p>
                {settings.contact_address}
              </p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()}{" "}
            {settings.site_name}.{" "}
            {settings.footer_copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
