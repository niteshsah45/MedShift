import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ConfirmModal from "../../components/ConfirmModal";
import api from "../../services/api";

function HospitalRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      console.error(
        "Failed to load requests:",
        error
      );

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

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase()}`;
  };

  // Close request
  const handleClose = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError("");
      setSuccess("");

      await api.patch(
        `/requests/${requestId}/close`
      );

      setSuccess(
        "Staffing request closed successfully."
      );

      await fetchRequests();

    } catch (error) {
      console.error(
        "Failed to close request:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to close staffing request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Reopen request
  const handleReopen = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError("");
      setSuccess("");

      await api.patch(
        `/requests/${requestId}/reopen`
      );

      setSuccess(
        "Staffing request reopened successfully."
      );

      await fetchRequests();

    } catch (error) {
      console.error(
        "Failed to reopen request:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reopen staffing request."
      );
    } finally {
      setActionLoading(null);
    }
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
            className="nav-link"
          >
            Dashboard
          </Link>

          <Link
            to="/hospital/requests"
            className="nav-link active"
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
              navigate(
                "/hospital/requests/create"
              )
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


        {/* Success */}

        {success && (
          <div className="application-success">
            {success}
          </div>
        )}


        {/* Loading */}

        {loading ? (

          <div className="dashboard-loading">
            <p>
              Loading staffing requests...
            </p>
          </div>

        ) : requests.length === 0 ? (

          /* Empty state */

          <section className="dashboard-section">

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No staffing requests
              </h3>

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
                    <th>Action</th>
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


                      {/* Action */}

                      <td>

                        {request.status ===
                          "OPEN" && (

                          <button
                            className="request-close-button"
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            onClick={() =>
                              setConfirmation({
                                type: "close",
                                requestId:
                                  request._id,
                              })
                            }
                          >
                            Close
                          </button>

                        )}


                        {request.status ===
                          "CLOSED" && (

                          <button
                            className="request-reopen-button"
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            onClick={() =>
                              setConfirmation({
                                type: "reopen",
                                requestId:
                                  request._id,
                              })
                            }
                          >
                            Reopen
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* Confirmation modal */}

        {confirmation && (

          <ConfirmModal

            title={
              confirmation.type === "close"
                ? "Close Staffing Request"
                : "Reopen Staffing Request"
            }

            message={
              confirmation.type === "close"
                ? "Are you sure you want to close this staffing request? Professionals will no longer be able to apply."
                : "Are you sure you want to reopen this staffing request?"
            }

            confirmText={
              confirmation.type === "close"
                ? "Close Request"
                : "Reopen Request"
            }

            danger={
              confirmation.type === "close"
            }

            onCancel={() =>
              setConfirmation(null)
            }

            onConfirm={async () => {

              if (
                confirmation.type ===
                "close"
              ) {
                await handleClose(
                  confirmation.requestId
                );
              } else {
                await handleReopen(
                  confirmation.requestId
                );
              }

              setConfirmation(null);
            }}

            loading={
              actionLoading ===
              confirmation.requestId
            }

          />

        )}

      </main>

    </div>
  );
}

export default HospitalRequests;