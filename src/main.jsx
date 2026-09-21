import { useEffect, useState } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import {
  getPublicWebsiteSettings,
  settingsToObject
} from "./services/websiteService";

const DEFAULT_SETTINGS = {
  site_name: "Canada Immigration Services",
  site_favicon: "/favicon.ico"
};

function WebsiteSettingsProvider({
  children
}) {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

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
          "Unable to load website settings:",
          error
        );
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (settings.site_name) {
      document.title =
        settings.site_name;
    }

    if (settings.site_favicon) {
      let favicon =
        document.querySelector(
          'link[rel="icon"]'
        );

      if (!favicon) {
        favicon =
          document.createElement(
            "link"
          );

        favicon.rel = "icon";

        document.head.appendChild(
          favicon
        );
      }

      favicon.href =
        settings.site_favicon;
    }
  }, [settings]);

  return children;
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <WebsiteSettingsProvider>
        <App />
      </WebsiteSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
