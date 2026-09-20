import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import { signInAdmin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && admin) {
      const destination = location.state?.from || "/admin";
      navigate(destination, { replace: true });
    }
  }, [admin, authLoading, location.state, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email, password);

      const destination = location.state?.from || "/admin";
      navigate(destination, { replace: true });
    } catch (loginError) {
      console.error("Administrator login failed:", loginError);
      setError(
        loginError?.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section">
      <div className="container">
        <div className="form-card admin-login-card">
          <div className="section-heading">
            <span className="eyebrow">Administration</span>
            <h1>Administrator Login</h1>
            <p>
              Sign in with your authorized administrator account to access the
              administration area.
            </p>
          </div>

          {error && (
            <AlertMessage
              type="error"
              title="Sign-in failed"
              message={error}
            />
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="Enter your administrator email"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !email.trim() || !password}
              >
                {submitting ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AdminLoginPage;
