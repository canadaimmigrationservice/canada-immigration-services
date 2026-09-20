import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "./Loading";
import { useAuth } from "../context/AuthContext";

function ProtectedAdminRoute() {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <Loading message="Checking administrator access..." />
        </div>
      </main>
    );
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
