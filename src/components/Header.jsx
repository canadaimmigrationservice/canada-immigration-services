import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "../services/websiteService";

const DEFAULT_SETTINGS = {
  site_name: "Canada Immigration Services",
  site_logo: ""
};

function Header() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

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
          ...DEFAULT_SETTINGS,
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

  const navItems = [
    {
      to: "/",
      label: "Home",
      end: true
    },
    {
      to: "/about",
      label: "About"
    },
    {
      to: "/visa-services",
      label: "Visa Services"
    },
    {
      to: "/apply",
      label: "Apply for Visa"
    },
    {
      to: "/check-application",
      label: "Check Your Application"
    },
    {
      to: "/contact",
      label: "Contact"
    }
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          to="/"
          className="site-brand"
          onClick={closeMenu}
        >
          {settings.site_logo ? (
            <img
              src={settings.site_logo}
              alt={settings.site_name}
              className="site-logo"
            />
          ) : null}

          <span className="site-name">
            {settings.site_name}
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-nav ${
            menuOpen
              ? "site-nav-open"
              : ""
          }`}
          aria-label="Main navigation"
        >
          {navItems.map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
