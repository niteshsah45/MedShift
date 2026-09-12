import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function HospitalRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/requests/my");

      console.log("Hospital requests:", response.data);

      setRequests(
        Array.isArray(response.data.data)
          ? response.data.data
          : []
      );
    } catch (error) {
      console.error("Failed to load requests:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load staffing requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase()}`;
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

          <button
            className="nav-link"
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="nav-link active"
            onClick={() =>
              navigate("/hospital/requests")
            }
          >
            My Requests
          </button>

          <button
            className="nav-link"
            onClick={() =>
              navigate("/hospital/applications")
            }
          >
            Applications
          </button>

          <button
            className="nav-link"
            onClick={() =>
              navigate("/hospital/assignments")
            }
          >
            Assignments
          </button>

          <button
            className="nav-link"
            onClick={() =>
              navigate("/hospital/profile")
            }
          >
            Profile
          </button>

          <button
            className="nav-link"
            onClick={() =>
              navigate("/notifications")
            }
          >
            Notifications
          </button>

        </nav>

      </aside>


      {/* Main */}
      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>
            <h1>My Staffing Requests</h1>

            <p>
              Create and manage your hospital's
              staffing requirements.
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

            <button onClick={fetchRequests}>
              Try Again
            </button>
          </div>
        )}


        {/* Loading */}
        {loading ? (

          <div className="dashboard-loading">
            <p>Loading staffing requests...</p>
          </div>

        ) : requests.length === 0 ? (

          /* Empty */
          <section className="dashboard-section">

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>No staffing requests</h3>

              <p>
                You haven't created any staffing
                requests yet.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/hospital/requests/create"
                  )
                }
              >
                Create Your First Request
              </button>

            </div>

          </section>

        ) : (

          /* Requests */
          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  All Staffing Requests
                </h2>

                <p>
                  {requests.length} request
                  {requests.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

            </div>


            <div className="requests-table-wrapper">

              <table className="requests-table">

                <thead>

                  <tr>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Shift</th>
                    <th>Positions</th>
                    <th>Pay</th>
                    <th>Status</th>
                  </tr>

                </thead>


                <tbody>

                  {requests.map((request) => (

                    <tr key={request._id}>

                      {/* Role */}
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


                      {/* Department */}
                      <td>
                        {request.department || "—"}
                      </td>


                      {/* Shift */}
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


                      {/* Positions */}
                      <td>
                        {request.positionsFilled || 0}
                        {" / "}
                        {request.positions}
                      </td>


                      {/* Pay */}
                      <td>
                        ₹{request.pay}
                      </td>


                      {/* Status */}
                      <td>

                        <span
                          className={getStatusClass(
                            request.status
                          )}
                        >
                          {request.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default HospitalRequests;