import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOutAdmin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const adminNavigation = [
  { label: "Dashboard", path: "/admin" },
  { label: "Applications", path: "/admin/applications" },
  { label: "Visa Management", path: "/admin/visa-management" },
  { label: "Applicant Documents", path: "/admin/applicant-documents" },
  { label: "Visa Documents", path: "/admin/visa-documents" },
  { label: "Messages", path: "/admin/messages" },
  { label: "Website Settings", path: "/admin/website-settings" },
  { label: "Email Settings", path: "/admin/email-settings" },
  { label: "Admin Settings", path: "/admin/admin-settings" }
];

function AdminLayout() {
  const navigate = useNavigate();
  const { admin } = useAuth();

  async function handleLogout() {
    try {
      await signOutAdmin();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Administrator logout failed:", error);
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="eyebrow">Canada Immigration Services</span>
          <h2>Administration</h2>
        </div>

        <nav className="admin-nav" aria-label="Administration navigation">
          {adminNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <strong>{admin?.adminProfile?.full_name || "Administrator"}</strong>
            <span>{admin?.adminProfile?.role || "admin"}</span>
          </div>

          <button
            type="button"
            className="btn btn-outline admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
