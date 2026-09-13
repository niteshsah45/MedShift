import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

import api from "../../services/api";

function HospitalAssignments() {
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/assignments/hospital"
      );

      console.log(
        "Hospital assignments:",
        response.data
      );

      const assignmentData = Array.isArray(
        response.data.data
      )
        ? response.data.data
        : [];

      setAssignments(assignmentData);

    } catch (error) {
      console.error(
        "Failed to load assignments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAssignments();
  }, []);


  const handleComplete = async (assignmentId) => {
    try {
      setActionLoading(assignmentId);
      setError("");
      setSuccess("");

      await api.patch(
        `/assignments/${assignmentId}/complete`
      );

      setSuccess(
        "Assignment marked as completed."
      );

      await fetchAssignments();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to complete assignment."
      );
    } finally {
      setActionLoading(null);
    }
  };


  const handleCancel = async (assignmentId) => {
    try {
      setActionLoading(assignmentId);
      setError("");
      setSuccess("");

      await api.patch(
        `/assignments/${assignmentId}/cancel-by-hospital`
      );

      setSuccess(
        "Assignment cancelled successfully."
      );

      await fetchAssignments();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to cancel assignment."
      );
    } finally {
      setActionLoading(null);
    }
  };


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


  const getProfessional = (assignment) => {
    if (
      assignment.professionalId &&
      typeof assignment.professionalId === "object"
    ) {
      return assignment.professionalId;
    }

    return null;
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
            className="nav-link active"
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
            <h1>Assignments</h1>

            <p>
              Manage professionals assigned to
              your hospital shifts.
            </p>
          </div>

        </header>


        {/* Error */}

        {error && (
          <div className="dashboard-error">

            <span>{error}</span>

            <button onClick={fetchAssignments}>
              Try Again
            </button>

          </div>
        )}


        {/* Success */}

        {success && (
          <div className="assignment-success">
            {success}
          </div>
        )}


        {loading ? (

          <div className="dashboard-loading">
            <p>Loading assignments...</p>
          </div>

        ) : assignments.length === 0 ? (

          <section className="dashboard-section">

            <div className="empty-state">

              <div className="empty-icon">
                📅
              </div>

              <h3>No assignments yet</h3>

              <p>
                Accepted applications will appear
                here as assignments.
              </p>

            </div>

          </section>

        ) : (

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Assigned Professionals
                </h2>

                <p>
                  {assignments.length} assignment
                  {assignments.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

            </div>


            <div className="assignments-list">

              {assignments.map((assignment) => {

                const professional =
                  getProfessional(assignment);

                return (
                  <div
                    className="assignment-card"
                    key={assignment._id}
                  >

                    {/* Professional */}

                    <div className="assignment-professional">

                      <h3>
                        {professional?.name ||
                          "Healthcare Professional"}
                      </h3>

                      <p>
                        {professional?.role ||
                          "Professional"}

                        {professional?.specialization &&
                          ` • ${professional.specialization}`}
                      </p>

                      {professional?.experienceYears !==
                        undefined && (
                        <small>
                          {professional.experienceYears}{" "}
                          years experience
                        </small>
                      )}

                    </div>


                    {/* Shift */}

                    <div className="assignment-shift">

                      <strong>
                        Shift
                      </strong>

                      <span>
                        {formatDate(
                          assignment.startAt
                        )}
                      </span>

                      <small>
                        {formatTime(
                          assignment.startAt
                        )}
                        {" - "}
                        {formatTime(
                          assignment.endAt
                        )}
                      </small>

                    </div>


                    {/* Location */}

                    <div className="assignment-location">

                      <strong>
                        Location
                      </strong>

                      <span>
                        {assignment.location ||
                          "—"}
                      </span>

                    </div>


                    {/* Actions */}

                    <div className="assignment-actions">

                      <span
                        className={`status-badge status-${assignment.status?.toLowerCase()}`}
                      >
                        {assignment.status}
                      </span>


                      {assignment.status ===
                        "ACTIVE" && (

                        <div className="assignment-buttons">

                          <button
                            className="reject-button"
                            disabled={
                              actionLoading ===
                              assignment._id
                            }
                            onClick={() =>
                                setConfirmation({
                                    type: "cancel",
                                    assignmentId: assignment._id,
                                })
                             }
                          >
                            {actionLoading ===
                            assignment._id
                              ? "Processing..."
                              : "Cancel"}
                          </button>


                          <button
                            className="accept-button"
                            disabled={
                              actionLoading ===
                              assignment._id
                            }
                            onClick={() =>
                                setConfirmation({
                                    type: "complete",
                                    assignmentId: assignment._id,
                                })
                            }
                          >
                            {actionLoading ===
                            assignment._id
                              ? "Processing..."
                              : "Complete"}
                          </button>

                        </div>

                      )}

                    </div>

                  </div>
                );

              })}

            </div>

          </section>

        )}

      </main>

      {confirmation && (
        <ConfirmModal
            title={
            confirmation.type === "complete"
                ? "Complete Assignment"
                : "Cancel Assignment"
            }

            message={
            confirmation.type === "complete"
                ? "Are you sure this shift has been completed?"
                : "Are you sure you want to cancel this assignment?"
            }

            confirmText={
            confirmation.type === "complete"
                ? "Complete"
                : "Cancel Assignment"
            }

            danger={
            confirmation.type === "cancel"
            }

            onCancel={() => {
            setConfirmation(null);
            }}

            onConfirm={async () => {

            if (confirmation.type === "complete") {
                await handleComplete(
                confirmation.assignmentId
                );
            } else {
                await handleCancel(
                confirmation.assignmentId
                );
            }

            setConfirmation(null);
            }}

            loading={
            actionLoading ===
            confirmation.assignmentId
            }
        />
    )}

    </div>
  );
}

export default HospitalAssignments;