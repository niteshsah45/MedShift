import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";

function ProfessionalAssignments() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("upcoming");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [confirmation, setConfirmation] =
    useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/assignments/my"
      );

      setAssignments(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch assignments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load your assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* =========================================
     Helpers
  ========================================= */

  const getRequest = (assignment) => {
    return assignment.requestId || {};
  };

  const getHospital = (assignment) => {
    const request = getRequest(assignment);

    return request.hospitalId || {};
  };

  const formatDate = (date) => {
    if (!date) return "-";

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
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "assignment-status-active";

      case "COMPLETED":
        return "assignment-status-completed";

      case "CANCELLED":
        return "assignment-status-cancelled";

      default:
        return "assignment-status-neutral";
    }
  };

  /* =========================================
     Counts
  ========================================= */

  const counts = useMemo(() => {
    return {
      all: assignments.length,

      active: assignments.filter(
        (assignment) =>
          assignment.status === "ACTIVE"
      ).length,

      completed: assignments.filter(
        (assignment) =>
          assignment.status === "COMPLETED"
      ).length,

      cancelled: assignments.filter(
        (assignment) =>
          assignment.status === "CANCELLED"
      ).length,
    };
  }, [assignments]);

  /* =========================================
     Filter + Search + Sort
  ========================================= */

  const filteredAssignments = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = assignments.filter(
      (assignment) => {
        const request =
          getRequest(assignment);

        const hospital =
          getHospital(assignment);

        /* Status */

        if (
          statusFilter !== "ALL" &&
          assignment.status !== statusFilter
        ) {
          return false;
        }

        /* Search */

        if (normalizedSearch) {
          const searchableText = [
            request.department,
            request.requiredRole,
            request.specialization,
            request.location,
            hospital.hospitalName,
            assignment.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(
              normalizedSearch
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.startAt || 0) -
            new Date(b.startAt || 0)
          );

        case "latest":
          return (
            new Date(b.startAt || 0) -
            new Date(a.startAt || 0)
          );

        case "newest":
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );

        case "upcoming":
        default:
          return (
            new Date(a.startAt || 0) -
            new Date(b.startAt || 0)
          );
      }
    });
  }, [
    assignments,
    statusFilter,
    search,
    sortBy,
  ]);

  /* =========================================
     Clear filters
  ========================================= */

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSearch("");
    setSortBy("upcoming");
  };

  const hasFilters =
    statusFilter !== "ALL" ||
    search ||
    sortBy !== "upcoming";

  /* =========================================
     Open Details
  ========================================= */

  const openDetails = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const closeDetails = () => {
    if (!actionLoading) {
      setSelectedAssignment(null);
    }
  };

  /* =========================================
     Complete
  ========================================= */

  const handleCompleteClick = (assignment) => {
    setConfirmation({
      type: "complete",
      assignment,
      title: "Complete this shift?",
      message: `Mark your ${getRequest(
        assignment
      ).department || "assigned"} shift at ${
        getHospital(assignment).hospitalName ||
        "the hospital"
      } as completed.`,
      confirmText: "Complete Shift",
    });
  };

  /* =========================================
     Cancel
  ========================================= */

  const handleCancelClick = (assignment) => {
    setConfirmation({
      type: "cancel",
      assignment,
      title: "Cancel this shift?",
      message:
        "Are you sure you want to cancel this assignment? The hospital will be notified.",
      confirmText: "Cancel Shift",
      danger: true,
    });
  };

  /* =========================================
     Confirm Action
  ========================================= */

  const handleConfirmAction = async () => {
    if (!confirmation?.assignment) {
      return;
    }

    const assignment =
      confirmation.assignment;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (
        confirmation.type === "complete"
      ) {
        await api.patch(
          `/assignments/${assignment._id}/complete`
        );

        setSuccess(
          "Shift marked as completed successfully."
        );
      } else {
        await api.patch(
          `/assignments/${assignment._id}/cancel-by-professional`
        );

        setSuccess(
          "Assignment cancelled successfully."
        );
      }

      setConfirmation(null);
      setSelectedAssignment(null);

      await fetchAssignments();
    } catch (error) {
      console.error(
        "Failed to update assignment:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update assignment."
      );

      setConfirmation(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* =====================================
          Sidebar
      ===================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>MedShift</h2>
          <span>Professional Portal</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/professional/dashboard"
            className="sidebar-link"
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
            className="sidebar-link active"
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

      {/* =====================================
          Main
      ===================================== */}

      <main className="dashboard-main">

        <div className="professional-assignments-page">

          {/* Header */}

          <div className="assignments-page-header">

            <div>
              <h1>My Assignments</h1>

              <p>
                Manage your confirmed shifts and
                completed work.
              </p>
            </div>

            <Link
              to="/professional/requests"
              className="primary-button"
            >
              Find More Shifts
            </Link>

          </div>

          {error && (
            <div className="profile-message profile-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-message profile-message-success">
              {success}
            </div>
          )}

          {/* =================================
              Status Tabs
          ================================= */}

          <div className="assignment-status-tabs">

            <button
              className={
                statusFilter === "ALL"
                  ? "assignment-tab active"
                  : "assignment-tab"
              }
              onClick={() =>
                setStatusFilter("ALL")
              }
            >
              <span>All</span>
              <strong>{counts.all}</strong>
            </button>

            <button
              className={
                statusFilter === "ACTIVE"
                  ? "assignment-tab active"
                  : "assignment-tab"
              }
              onClick={() =>
                setStatusFilter("ACTIVE")
              }
            >
              <span>Active</span>
              <strong>{counts.active}</strong>
            </button>

            <button
              className={
                statusFilter === "COMPLETED"
                  ? "assignment-tab active"
                  : "assignment-tab"
              }
              onClick={() =>
                setStatusFilter("COMPLETED")
              }
            >
              <span>Completed</span>
              <strong>{counts.completed}</strong>
            </button>

            <button
              className={
                statusFilter === "CANCELLED"
                  ? "assignment-tab active"
                  : "assignment-tab"
              }
              onClick={() =>
                setStatusFilter("CANCELLED")
              }
            >
              <span>Cancelled</span>
              <strong>{counts.cancelled}</strong>
            </button>

          </div>

          {/* =================================
              Toolbar
          ================================= */}

          <div className="assignments-toolbar">

            <div className="assignments-search">

              <label htmlFor="assignment-search">
                Search
              </label>

              <input
                id="assignment-search"
                type="text"
                placeholder="Search hospital, department, location..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <div className="assignments-sort">

              <label htmlFor="assignment-sort">
                Sort by
              </label>

              <select
                id="assignment-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="upcoming">
                  Upcoming shifts
                </option>

                <option value="newest">
                  Recently assigned
                </option>

                <option value="latest">
                  Shift date: Latest
                </option>

                <option value="oldest">
                  Shift date: Earliest
                </option>

              </select>

            </div>

            {hasFilters && (
              <button
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}

          </div>

          {/* Result count */}

          <div className="assignments-result-count">
            Showing{" "}
            <strong>
              {filteredAssignments.length}
            </strong>{" "}
            {filteredAssignments.length === 1
              ? "assignment"
              : "assignments"}
          </div>

          {/* =================================
              Assignment List
          ================================= */}

          {filteredAssignments.length === 0 ? (

            <div className="assignments-empty">

              <div className="assignments-empty-icon">
                —
              </div>

              <h2>
                No assignments found
              </h2>

              <p>
                {hasFilters
                  ? "Try changing your filters or search."
                  : "You do not have any assignments yet."}
              </p>

              {hasFilters ? (
                <button
                  className="secondary-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/professional/requests"
                  className="primary-button"
                >
                  Find a Shift
                </Link>
              )}

            </div>

          ) : (

            <div className="professional-assignment-list">

              {filteredAssignments.map(
                (assignment) => {

                  const request =
                    getRequest(assignment);

                  const hospital =
                    getHospital(assignment);

                  const location =
                    assignment.location ||
                    request.location;

                  return (
                    <article
                      className="professional-assignment-card"
                      key={assignment._id}
                    >

                      <div className="assignment-card-main">

                        {/* Title */}

                        <div className="assignment-card-title">

                          <div>

                            <h2>
                              {request.department ||
                                "Assigned Shift"}
                            </h2>

                            <p>
                              {request.requiredRole ||
                                ""}

                              {request.specialization
                                ? ` • ${request.specialization}`
                                : ""}
                            </p>

                          </div>

                          <span
                            className={`assignment-status ${getStatusClass(
                              assignment.status
                            )}`}
                          >
                            {formatStatus(
                              assignment.status
                            )}
                          </span>

                        </div>

                        {/* Details */}

                        <div className="assignment-card-details">

                          <div>
                            <span>Hospital</span>

                            <strong>
                              {hospital.hospitalName ||
                                "Hospital"}
                            </strong>
                          </div>

                          <div>
                            <span>Location</span>

                            <strong>
                              {location || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Date</span>

                            <strong>
                              {formatDate(
                                assignment.startAt
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Time</span>

                            <strong>
                              {formatTime(
                                assignment.startAt
                              )}{" "}
                              -{" "}
                              {formatTime(
                                assignment.endAt
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Pay</span>

                            <strong>
                              ₹{request.pay || 0}
                            </strong>
                          </div>

                        </div>

                      </div>

                      {/* Actions */}

                      <div className="assignment-card-actions">

                        <button
                          className="secondary-button"
                          onClick={() =>
                            openDetails(
                              assignment
                            )
                          }
                        >
                          View Details
                        </button>

                        {assignment.status ===
                          "ACTIVE" && (
                          <>
                            <button
                              className="primary-button"
                              onClick={() =>
                                handleCompleteClick(
                                  assignment
                                )
                              }
                            >
                              Complete
                            </button>

                            <button
                              className="assignment-cancel-button"
                              onClick={() =>
                                handleCancelClick(
                                  assignment
                                )
                              }
                            >
                              Cancel Shift
                            </button>
                          </>
                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>

      </main>

      {/* =====================================
          Details Modal
      ===================================== */}

      {selectedAssignment && (
        <div
          className="modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="assignment-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="assignment-details-header">

              <div>
                <h2>
                  {getRequest(
                    selectedAssignment
                  ).department ||
                    "Assigned Shift"}
                </h2>

                <p>
                  {getRequest(
                    selectedAssignment
                  ).requiredRole || ""}

                  {getRequest(
                    selectedAssignment
                  ).specialization
                    ? ` • ${
                        getRequest(
                          selectedAssignment
                        ).specialization
                      }`
                    : ""}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            <div className="assignment-details-body">

              <div className="assignment-detail-block">
                <span>Status</span>

                <strong>
                  {formatStatus(
                    selectedAssignment.status
                  )}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Hospital</span>

                <strong>
                  {getHospital(
                    selectedAssignment
                  ).hospitalName ||
                    "Hospital"}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Department</span>

                <strong>
                  {getRequest(
                    selectedAssignment
                  ).department || "-"}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Professional Role</span>

                <strong>
                  {getRequest(
                    selectedAssignment
                  ).requiredRole || "-"}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Specialization</span>

                <strong>
                  {getRequest(
                    selectedAssignment
                  ).specialization ||
                    "Not specified"}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Location</span>

                <strong>
                  {selectedAssignment.location ||
                    getRequest(
                      selectedAssignment
                    ).location ||
                    "-"}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Start</span>

                <strong>
                  {formatDate(
                    selectedAssignment.startAt
                  )}{" "}
                  •{" "}
                  {formatTime(
                    selectedAssignment.startAt
                  )}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>End</span>

                <strong>
                  {formatDate(
                    selectedAssignment.endAt
                  )}{" "}
                  •{" "}
                  {formatTime(
                    selectedAssignment.endAt
                  )}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Pay</span>

                <strong className="assignment-detail-pay">
                  ₹
                  {getRequest(
                    selectedAssignment
                  ).pay || 0}
                </strong>
              </div>

              <div className="assignment-detail-block">
                <span>Assigned On</span>

                <strong>
                  {formatDate(
                    selectedAssignment.createdAt
                  )}
                </strong>
              </div>

            </div>

            {selectedAssignment.status ===
              "ACTIVE" && (
              <div className="assignment-details-actions">

                <button
                  className="secondary-button"
                  onClick={closeDetails}
                >
                  Close
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    handleCompleteClick(
                      selectedAssignment
                    )
                  }
                >
                  Complete Shift
                </button>

                <button
                  className="assignment-cancel-button"
                  onClick={() =>
                    handleCancelClick(
                      selectedAssignment
                    )
                  }
                >
                  Cancel Shift
                </button>

              </div>
            )}

          </div>

        </div>
      )}

      {/* =====================================
          Confirmation
      ===================================== */}

      {confirmation && (
        <ConfirmModal
          title={confirmation.title}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText="Go Back"
          danger={confirmation.danger}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() =>
            setConfirmation(null)
          }
        />
      )}

    </div>
  );
}

export default ProfessionalAssignments;