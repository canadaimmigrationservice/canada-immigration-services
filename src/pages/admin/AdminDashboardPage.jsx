import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import AlertMessage from "../../components/AlertMessage";
import { supabase } from "../../lib/supabase";

const initialStats = {
  totalApplications: 0,
  submitted: 0,
  inProgress: 0,
  closed: 0,
  pendingDecisions: 0,
  approved: 0,
  rejected: 0
};

function AdminDashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const { data, error: requestError } = await supabase
          .from("applications")
          .select(
            "id, application_status, decision_status",
            { count: "exact" }
          );

        if (requestError) {
          throw requestError;
        }

        const applications = data || [];

        const nextStats = {
          totalApplications: applications.length,
          submitted: applications.filter(
            (item) => item.application_status === "Submitted"
          ).length,
          inProgress: applications.filter(
            (item) => item.application_status === "In Progress"
          ).length,
          closed: applications.filter(
            (item) => item.application_status === "Closed"
          ).length,
          pendingDecisions: applications.filter(
            (item) => item.decision_status === "Pending"
          ).length,
          approved: applications.filter(
            (item) => item.decision_status === "Approved"
          ).length,
          rejected: applications.filter(
            (item) => item.decision_status === "Rejected"
          ).length
        };

        if (mounted) {
          setStats(nextStats);
        }
      } catch (requestError) {
        console.error("Unable to load administrator dashboard:", requestError);

        if (mounted) {
          setError(
            "We could not load the dashboard statistics. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Dashboard</h1>
          <p>
            Monitor applications and review current processing activity.
          </p>
        </div>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Dashboard unavailable"
          message={error}
        />
      )}

      {loading ? (
        <Loading message="Loading dashboard statistics..." />
      ) : (
        <>
          <section className="admin-stats-grid">
            <div className="stat-card">
              <span>Total Applications</span>
              <strong>{stats.totalApplications}</strong>
            </div>

            <div className="stat-card">
              <span>Submitted</span>
              <strong>{stats.submitted}</strong>
            </div>

            <div className="stat-card">
              <span>In Progress</span>
              <strong>{stats.inProgress}</strong>
            </div>

            <div className="stat-card">
              <span>Closed</span>
              <strong>{stats.closed}</strong>
            </div>

            <div className="stat-card">
              <span>Pending Decisions</span>
              <strong>{stats.pendingDecisions}</strong>
            </div>

            <div className="stat-card">
              <span>Approved</span>
              <strong>{stats.approved}</strong>
            </div>

            <div className="stat-card">
              <span>Rejected</span>
              <strong>{stats.rejected}</strong>
            </div>
          </section>

          <section className="admin-card">
            <div className="section-heading">
              <span className="eyebrow">Application Activity</span>
              <h2>Processing Overview</h2>
              <p>
                Use the administration navigation to open applications,
                manage visa services, review documents, and update website
                settings.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboardPage;
