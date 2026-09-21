import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/dashboard");

      setStatistics(response.data?.data);
    } catch (error) {
      console.error(
        "Failed to load admin dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStat = (key) => {
    if (loading) return "...";

    return statistics?.[key] ?? 0;
  };

  return (
    <div className="dashboard admin-dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>MedShift</h2>
          <span>Admin Portal</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/admin/dashboard"
            className="nav-link active"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/professional-verification"
            className="nav-link"
          >
            Professional Verification
          </Link>

          <Link
            to="/admin/hospital-verification"
            className="nav-link"
          >
            Hospital Verification
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}

      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor MedShift platform activity and
              verification requests.
            </p>

          </div>

        </div>


        {/* Platform Statistics */}

        <section>

          <div className="admin-section-header">

            <div>

              <h2>Platform Overview</h2>

              <p>
                Current activity across the MedShift
                platform.
              </p>

            </div>

          </div>


          <div className="admin-stats-grid">

            {/* Professionals */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Total Professionals</span>

                <strong>
                  {getStat("totalProfessionals")}
                </strong>

              </div>

            </div>


            {/* Hospitals */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Total Hospitals</span>

                <strong>
                  {getStat("totalHospitals")}
                </strong>

              </div>

            </div>


            {/* Staffing Requests */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Total Staffing Requests</span>

                <strong>
                  {getStat("totalStaffingRequests")}
                </strong>

              </div>

            </div>


            {/* Open Requests */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Open Staffing Requests</span>

                <strong>
                  {getStat("openStaffingRequests")}
                </strong>

              </div>

            </div>


            {/* Active Assignments */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Active Assignments</span>

                <strong>
                  {getStat("activeAssignments")}
                </strong>

              </div>

            </div>


            {/* Completed Assignments */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Completed Assignments</span>

                <strong>
                  {getStat("completedAssignments")}
                </strong>

              </div>

            </div>


            {/* Applications */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>Total Applications</span>

                <strong>
                  {getStat("totalApplications")}
                </strong>

              </div>

            </div>


            {/* Professional Verification */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>
                  Pending Professional Verification
                </span>

                <strong>
                  {getStat(
                    "pendingProfessionalVerifications"
                  )}
                </strong>

              </div>

            </div>


            {/* Hospital Verification */}

            <div className="admin-stat-card">

              <div className="admin-stat-content">

                <span>
                  Pending Hospital Verification
                </span>

                <strong>
                  {getStat(
                    "pendingHospitalVerifications"
                  )}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* Verification Actions */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>

              <h2>Verification</h2>

              <p>
                Review submitted professional and
                hospital information.
              </p>

            </div>

          </div>


          <div className="admin-action-grid">

            {/* Professional Verification */}

            <Link
              to="/admin/professional-verification"
              className="admin-action-card"
            >

              <h3>
                Professional Verification
              </h3>

              <p>
                Review professional documents and
                approve or reject verification requests.
              </p>

              <span>
                {getStat(
                  "pendingProfessionalVerifications"
                )}{" "}
                pending
              </span>

            </Link>


            {/* Hospital Verification */}

            <Link
              to="/admin/hospital-verification"
              className="admin-action-card"
            >

              <h3>
                Hospital Verification
              </h3>

              <p>
                Review hospitals waiting for verification.
              </p>

              <span>
                {getStat(
                  "pendingHospitalVerifications"
                )}{" "}
                pending
              </span>

            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;