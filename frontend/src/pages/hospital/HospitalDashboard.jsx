import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function HospitalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [hospital, setHospital] = useState(null);
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get hospital profile
      const hospitalResponse = await api.get("/hospitals/me");

      // Get hospital's staffing requests
      const requestsResponse = await api.get("/requests/my");

      // Get hospital assignments
      const assignmentsResponse =
        await api.get("/assignments/hospital");

      console.log("Hospital:", hospitalResponse.data);
      console.log("Requests:", requestsResponse.data);
      console.log("Assignments:", assignmentsResponse.data);

      const hospitalData = hospitalResponse.data.data;

      const requestData = Array.isArray(
        requestsResponse.data.data
      )
        ? requestsResponse.data.data
        : [];

      const assignmentData = Array.isArray(
        assignmentsResponse.data.data
      )
        ? assignmentsResponse.data.data
        : [];

      setHospital(hospitalData);
      setRequests(requestData);
      setAssignments(assignmentData);

      // Get applications for every request
      const applicationResponses = await Promise.all(
        requestData.map((request) =>
          api.get(
            `/applications/requests/${request._id}/applications`
          )
        )
      );

      const allApplications = applicationResponses.flatMap(
        (response) => {
          if (Array.isArray(response.data.data)) {
            return response.data.data;
          }

          return [];
        }
      );

      setApplications(allApplications);
    } catch (error) {
      console.error(
        "Failed to load hospital dashboard:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Request statistics
  const totalRequests = requests.length;

  const openRequests = requests.filter(
    (request) => request.status === "OPEN"
  ).length;

  const filledRequests = requests.filter(
    (request) => request.status === "FILLED"
  ).length;

  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "ACTIVE"
  ).length;

  const totalApplications = applications.length;

  // Format date/time
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>MedShift</h2>
          <span>Hospital Portal</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/hospital/dashboard"
            className="nav-link active"
          >
            Dashboard
          </Link>

          <Link
            to="/hospital/requests"
            className="nav-link"
          >
            My Requests
          </Link>

          <Link
            to="/hospital/applications"
            className="nav-link"
          >
            Applications
          </Link>

          <Link
            to="/hospital/assignments"
            className="nav-link"
          >
            Assignments
          </Link>

          <Link
            to="/hospital/profile"
            className="nav-link"
          >
            Profile
          </Link>

          <Link
            to="/notifications"
            className="nav-link"
          >
            Notifications
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <strong>
              {hospital?.hospitalName || "Hospital"}
            </strong>

            <span>
              {user?.email || ""}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* Main content */}
      <main className="dashboard-content">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <h1>
              Welcome,{" "}
              {hospital?.hospitalName || "Hospital"}
            </h1>

            <p>
              Manage your staffing requests and
              healthcare professionals.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/hospital/requests/create")
            }
          >
            + Create Request
          </button>

        </header>


        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <span>{error}</span>

            <button onClick={fetchDashboardData}>
              Try Again
            </button>
          </div>
        )}


        {/* Loading */}
        {loading ? (
          <div className="dashboard-loading">
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="stats">

              <div className="stat-card">
                <div className="stat-icon">
                  📋
                </div>

                <div>
                  <h3>Total Requests</h3>
                  <p>{totalRequests}</p>
                </div>
              </div>


              <div className="stat-card">
                <div className="stat-icon">
                  🟢
                </div>

                <div>
                  <h3>Open Requests</h3>
                  <p>{openRequests}</p>
                </div>
              </div>


              <div className="stat-card">
                <div className="stat-icon">
                  👨‍⚕️
                </div>

                <div>
                  <h3>Applications</h3>
                  <p>{totalApplications}</p>
                </div>
              </div>


              <div className="stat-card">
                <div className="stat-icon">
                  📅
                </div>

                <div>
                  <h3>Active Assignments</h3>
                  <p>{activeAssignments}</p>
                </div>
              </div>

            </section>


            {/* Requests section */}
            <section className="dashboard-section">

              <div className="section-header">

                <div>
                  <h2>Recent Staffing Requests</h2>

                  <p>
                    Manage the healthcare staff you
                    need for upcoming shifts.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("/hospital/requests")
                  }
                >
                  View All
                </button>

              </div>


              {requests.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    📋
                  </div>

                  <h3>No staffing requests yet</h3>

                  <p>
                    Create your first staffing request
                    to find healthcare professionals.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate(
                        "/hospital/requests/create"
                      )
                    }
                  >
                    Create Staffing Request
                  </button>

                </div>

              ) : (

                <div className="requests-table-wrapper">

                  <table className="requests-table">

                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Shift</th>
                        <th>Positions</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {requests
                        .slice(0, 5)
                        .map((request) => (

                          <tr key={request._id}>

                            <td>
                              <strong>
                                {request.requiredRole}
                              </strong>

                              {request.specialization && (
                                <small>
                                  {request.specialization}
                                </small>
                              )}
                            </td>


                            <td>
                              {request.department || "—"}
                            </td>


                            <td>
                              <div>
                                {formatDate(
                                  request.startAt
                                )}
                              </div>

                              <small>
                                {formatTime(
                                  request.startAt
                                )}
                                {" - "}
                                {formatTime(
                                  request.endAt
                                )}
                              </small>
                            </td>


                            <td>
                              {request.positionsFilled || 0}
                              {" / "}
                              {request.positions}
                            </td>


                            <td>
                              <span
                                className={`status-badge status-${request.status?.toLowerCase()}`}
                              >
                                {request.status}
                              </span>
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

            </section>


            {/* Quick actions */}
            <section className="dashboard-section">

              <div className="section-header">

                <div>
                  <h2>Quick Actions</h2>

                  <p>
                    Common hospital actions.
                  </p>
                </div>

              </div>


              <div className="quick-actions">

                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate(
                      "/hospital/requests/create"
                    )
                  }
                >
                  <span>➕</span>

                  <div>
                    <strong>
                      Create Staffing Request
                    </strong>

                    <p>
                      Find professionals for a shift.
                    </p>
                  </div>
                </button>


                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate(
                      "/hospital/applications"
                    )
                  }
                >
                  <span>👨‍⚕️</span>

                  <div>
                    <strong>
                      Review Applications
                    </strong>

                    <p>
                      Review professionals who applied.
                    </p>
                  </div>
                </button>


                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate(
                      "/hospital/assignments"
                    )
                  }
                >
                  <span>📅</span>

                  <div>
                    <strong>
                      View Assignments
                    </strong>

                    <p>
                      See your confirmed shifts.
                    </p>
                  </div>
                </button>

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default HospitalDashboard;