import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_CONTENT = {
  site_name: "Canada Immigration Services",
  logo_url: ""
};

const navigation = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Visa Services", path: "/visa-services" },
  { label: "Apply for Visa", path: "/apply" },
  {
    label: "Check Your Application",
    path: "/check-application"
  },
  { label: "Contact", path: "/contact" }
];

function Header() {
  const [settings, setSettings] =
    useState(DEFAULT_CONTENT);

  const [menuOpen, setMenuOpen] =
    useState(false);

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
          "Unable to load header settings:",
          error
        );
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          to="/"
          className="site-brand"
          onClick={closeMenu}
          aria-label={settings.site_name}
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="site-logo"
            />
          ) : (
            <span className="site-name">
              {settings.site_name}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
          aria-expanded={menuOpen}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={
            menuOpen
              ? "site-nav open"
              : "site-nav"
          }
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
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

export default Header;
