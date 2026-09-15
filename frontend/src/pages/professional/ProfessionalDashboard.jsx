import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ProfessionalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [professional, setProfessional] = useState(null);
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        professionalResponse,
        requestsResponse,
        applicationsResponse,
        assignmentsResponse,
      ] = await Promise.all([
        api.get("/professionals/me"),
        api.get("/requests"),
        api.get("/applications/my"),
        api.get("/assignments/my"),
      ]);

      setProfessional(professionalResponse.data.data);
      setRequests(requestsResponse.data.data || []);
      setApplications(applicationsResponse.data.data || []);
      setAssignments(assignmentsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "ACCEPTED":
        return "status-approved";

      case "REJECTED":
        return "status-rejected";

      case "WITHDRAWN":
        return "status-neutral";

      default:
        return "status-neutral";
    }
  };

  /*
   * Recommended shifts
   *
   * First try to match:
   * 1. Professional role
   * 2. Specialization
   *
   * Only OPEN requests are considered.
   */
  const recommendedRequests = requests
    .filter((request) => request.status === "OPEN")
    .filter((request) => {
      if (!professional) return false;

      const roleMatch =
        request.requiredRole?.toLowerCase() ===
        professional.role?.toLowerCase();

      const specializationMatch =
        !request.specialization ||
        !professional.specialization ||
        request.specialization.toLowerCase() ===
          professional.specialization.toLowerCase();

      return roleMatch && specializationMatch;
    })
    .slice(0, 2);

  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING"
  ).length;

  const acceptedApplications = applications.filter(
    (application) => application.status === "ACCEPTED"
  ).length;

  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "ACTIVE"
  ).length;

  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === "COMPLETED"
  ).length;

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>MedShift</h2>
          <span>Professional Portal</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/professional/dashboard"
            className="sidebar-link active"
          >
            Dashboard
          </Link>

          <Link
            to="/professional/requests"
            className="sidebar-link"
          >
            Find Shifts
          </Link>

          <Link
            to="/professional/applications"
            className="sidebar-link"
          >
            My Applications
          </Link>

          <Link
            to="/professional/assignments"
            className="sidebar-link"
          >
            My Assignments
          </Link>

          <Link
            to="/notifications"
            className="sidebar-link"
          >
            Notifications
          </Link>

          <Link
            to="/professional/profile"
            className="sidebar-link"
          >
            Profile
          </Link>

          <Link
            to="/professional/verification"
            className="sidebar-link"
          >
            Verification
          </Link>

        </nav>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">

          <div>
            <h1>
              Welcome back
              {professional?.name
                ? `, ${professional.name}`
                : ""}
            </h1>

            <p>
              Find suitable shifts and manage your
              professional assignments.
            </p>
          </div>

          <Link
            to="/professional/requests"
            className="primary-button"
          >
            Find Shifts
          </Link>

        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* Professional Info */}
        <section className="professional-summary">

          <div className="professional-summary-info">

            <div className="professional-avatar">
              {professional?.name
                ? professional.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </div>

            <div>
              <h2>
                {professional?.name || "Professional"}
              </h2>

              <p>
                {professional?.role
                  ? professional.role.charAt(0).toUpperCase() +
                    professional.role.slice(1)
                  : ""}
                {professional?.specialization
                  ? ` • ${professional.specialization}`
                  : ""}
              </p>

              {professional?.city && (
                <span>{professional.city}</span>
              )}
            </div>

          </div>

          <div>
            <span
              className={`profile-status ${
                professional?.verificationStatus ===
                "APPROVED"
                  ? "profile-status-approved"
                  : professional?.verificationStatus ===
                    "REJECTED"
                  ? "profile-status-rejected"
                  : "profile-status-pending"
              }`}
            >
              {professional?.verificationStatus ||
                "PENDING"}
            </span>
          </div>

        </section>

        {/* Stats */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <span>Pending Applications</span>
            <strong>{pendingApplications}</strong>
          </div>

          <div className="stat-card">
            <span>Accepted Applications</span>
            <strong>{acceptedApplications}</strong>
          </div>

          <div className="stat-card">
            <span>Active Assignments</span>
            <strong>{activeAssignments}</strong>
          </div>

          <div className="stat-card">
            <span>Completed Assignments</span>
            <strong>{completedAssignments}</strong>
          </div>

        </section>

        {/* Recommended Shifts */}
        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Recommended Shifts</h2>
              <p>
                Open shifts matching your role and
                specialization.
              </p>
            </div>

            <Link
              to="/professional/requests"
              className="section-link"
            >
              View all shifts
            </Link>

          </div>

          {recommendedRequests.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No matching shifts available</h3>
              <p>
                There are currently no open shifts
                matching your profile.
              </p>

              <Link
                to="/professional/requests"
                className="secondary-button"
              >
                Browse All Shifts
              </Link>
            </div>
          ) : (
            <div className="recommended-list">

              {recommendedRequests.map((request) => (
                <div
                  className="recommended-shift"
                  key={request._id}
                >

                  <div className="recommended-shift-info">

                    <h3>
                      {request.department}
                    </h3>

                    <p>
                      {request.requiredRole}
                      {request.specialization
                        ? ` • ${request.specialization}`
                        : ""}
                    </p>

                    <span>
                      {request.location}
                    </span>

                  </div>

                  <div className="recommended-shift-details">

                    <div>
                      <strong>
                        {formatDate(request.startAt)}
                      </strong>

                      <span>
                        {formatTime(request.startAt)}
                        {" - "}
                        {formatTime(request.endAt)}
                      </span>
                    </div>

                    <div>
                      <strong>
                        ₹{request.pay}
                      </strong>

                      <span>
                        {Math.max(
                          0,
                          request.positions -
                            request.positionsFilled
                        )}{" "}
                        position
                        {Math.max(
                          0,
                          request.positions -
                            request.positionsFilled
                        ) !== 1
                          ? "s"
                          : ""}{" "}
                        available
                      </span>
                    </div>

                    <Link
                      to={`/professional/requests/${request._id}`}
                      className="secondary-button"
                    >
                      View Details
                    </Link>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Recent Applications */}
        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Recent Applications</h2>
              <p>
                Track the latest shifts you have
                applied for.
              </p>
            </div>

            <Link
              to="/professional/applications"
              className="section-link"
            >
              View applications
            </Link>

          </div>

          {recentApplications.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No applications yet</h3>

              <p>
                Apply for a shift to see your
                applications here.
              </p>

              <Link
                to="/professional/requests"
                className="secondary-button"
              >
                Find a Shift
              </Link>
            </div>
          ) : (
            <div className="applications-table-wrapper">

              <table className="applications-table">

                <thead>
                  <tr>
                    <th>Shift</th>
                    <th>Hospital</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentApplications.map(
                    (application) => {

                      const request =
                        application.requestId;

                      const hospital =
                        request?.hospitalId;

                      return (
                        <tr
                          key={application._id}
                        >

                          <td>
                            <strong>
                              {request?.department ||
                                "Staffing Request"}
                            </strong>

                            <span>
                              {request?.requiredRole ||
                                ""}
                            </span>
                          </td>

                          <td>
                            {hospital?.hospitalName ||
                              "Hospital"}
                          </td>

                          <td>
                            {formatDate(
                              request?.startAt
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                application.status
                              )}`}
                            >
                              {application.status}
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default ProfessionalDashboard;