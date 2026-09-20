import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>Canada Immigration Services</strong>
          <p>Immigration and visa application services.</p>
        </div>

        <div className="footer-links">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/visa-services">Visa Services</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/check-application">
            Check Your Application
          </NavLink>
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

export default Footer;
