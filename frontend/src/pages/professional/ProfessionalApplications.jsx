import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import ConfirmModal from "../../components/ConfirmModal";

function ProfessionalApplications() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [withdrawModal, setWithdrawModal] = useState(null);
const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/my");

      setApplications(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch applications:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
// Helper functions to extract hospital information
  const getRequest = (application) => {
    return application.requestId || {};
  };

  const handleWithdrawApplication = async () => {
  if (!withdrawModal) return;

  try {
    setWithdrawing(true);
    setError("");
    setSuccess("");

    await api.patch(
      `/applications/${withdrawModal._id}/withdraw`
    );

    setSuccess("Application withdrawn successfully.");

    setWithdrawModal(null);

    await fetchApplications();
  } catch (error) {
    console.error(
      "Failed to withdraw application:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Failed to withdraw application."
    );
  } finally {
    setWithdrawing(false);
  }
};

  const getHospital = (application) => {
    const request = getRequest(application);

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

  /* =========================================
     Search + Filter + Sort
  ========================================= */

  const filteredApplications = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = applications.filter(
      (application) => {
        const request = getRequest(application);
        const hospital = getHospital(application);

        /* Status filter */

        if (
          statusFilter !== "ALL" &&
          application.status !== statusFilter
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

    /* Sort */

    return [...result].sort((a, b) => {
      const requestA = getRequest(a);
      const requestB = getRequest(b);

      switch (sortBy) {
        case "shift-asc":
          return (
            new Date(requestA.startAt || 0) -
            new Date(requestB.startAt || 0)
          );

        case "shift-desc":
          return (
            new Date(requestB.startAt || 0) -
            new Date(requestA.startAt || 0)
          );

        case "pay-high":
          return (
            Number(requestB.pay || 0) -
            Number(requestA.pay || 0)
          );

        case "pay-low":
          return (
            Number(requestA.pay || 0) -
            Number(requestB.pay || 0)
          );

        case "newest":
        default:
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );
      }
    });
  }, [
    applications,
    statusFilter,
    search,
    sortBy,
  ]);

  /* =========================================
     Counts
  ========================================= */

  const counts = useMemo(() => {
    return {
      all: applications.length,

      pending: applications.filter(
        (application) =>
          application.status === "PENDING"
      ).length,

      accepted: applications.filter(
        (application) =>
          application.status === "ACCEPTED"
      ).length,

      rejected: applications.filter(
        (application) =>
          application.status === "REJECTED"
      ).length,

      withdrawn: applications.filter(
        (application) =>
          application.status === "WITHDRAWN"
      ).length,
    };
  }, [applications]);

  /* =========================================
     Clear filters
  ========================================= */

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSearch("");
    setSortBy("newest");
  };

  const hasFilters =
    statusFilter !== "ALL" ||
    search ||
    sortBy !== "newest";

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading applications...
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
            className="sidebar-link active"
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

      {/* =====================================
          Main
      ===================================== */}

      <main className="dashboard-main">

        <div className="applications-page">

          {/* Header */}

          <div className="applications-page-header">

            <div>
              <h1>My Applications</h1>

              <p>
                Track the status of your shift
                applications.
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
              Status Summary
          ================================= */}

          <div className="application-status-tabs">

            <button
              className={
                statusFilter === "ALL"
                  ? "application-tab active"
                  : "application-tab"
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
                statusFilter === "PENDING"
                  ? "application-tab active"
                  : "application-tab"
              }
              onClick={() =>
                setStatusFilter("PENDING")
              }
            >
              <span>Pending</span>
              <strong>{counts.pending}</strong>
            </button>

            <button
              className={
                statusFilter === "ACCEPTED"
                  ? "application-tab active"
                  : "application-tab"
              }
              onClick={() =>
                setStatusFilter("ACCEPTED")
              }
            >
              <span>Accepted</span>
              <strong>{counts.accepted}</strong>
            </button>

            <button
              className={
                statusFilter === "REJECTED"
                  ? "application-tab active"
                  : "application-tab"
              }
              onClick={() =>
                setStatusFilter("REJECTED")
              }
            >
              <span>Rejected</span>
              <strong>{counts.rejected}</strong>
            </button>

            {counts.withdrawn > 0 && (
              <button
                className={
                  statusFilter === "WITHDRAWN"
                    ? "application-tab active"
                    : "application-tab"
                }
                onClick={() =>
                  setStatusFilter("WITHDRAWN")
                }
              >
                <span>Withdrawn</span>
                <strong>{counts.withdrawn}</strong>
              </button>
            )}

          </div>

          {/* =================================
              Search + Sort
          ================================= */}

          <div className="applications-toolbar">

            <div className="applications-search">

              <label htmlFor="application-search">
                Search
              </label>

              <input
                id="application-search"
                type="text"
                placeholder="Search department, hospital, role..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <div className="applications-sort">

              <label htmlFor="application-sort">
                Sort by
              </label>

              <select
                id="application-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  Newest application
                </option>

                <option value="shift-asc">
                  Shift date: Earliest
                </option>

                <option value="shift-desc">
                  Shift date: Latest
                </option>

                <option value="pay-high">
                  Pay: High to Low
                </option>

                <option value="pay-low">
                  Pay: Low to High
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

          {/* =================================
              Results
          ================================= */}

          <div className="applications-result-count">
            Showing{" "}
            <strong>
              {filteredApplications.length}
            </strong>{" "}
            {filteredApplications.length === 1
              ? "application"
              : "applications"}
          </div>

          {filteredApplications.length === 0 ? (

            <div className="applications-empty">

              <div className="applications-empty-icon">
                —
              </div>

              <h2>
                No applications found
              </h2>

              <p>
                {hasFilters
                  ? "Try changing your filters or search."
                  : "You have not applied for any shifts yet."}
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

            <div className="professional-applications-list">

              {filteredApplications.map(
                (application) => {

                  const request =
                    getRequest(application);

                  const hospital =
                    getHospital(application);

                  return (
                    <article
                      className="professional-application-card"
                      key={application._id}
                    >

                      {/* Main information */}

                      <div className="professional-application-main">

                        <div className="professional-application-title">

                          <div>

                            <h2>
                              {request.department ||
                                "Staffing Request"}
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
                            className={`status-badge ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {formatStatus(
                              application.status
                            )}
                          </span>

                        </div>

                        <div className="professional-application-details">

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
                              {request.location ||
                                "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Shift Date</span>

                            <strong>
                              {formatDate(
                                request.startAt
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Shift Time</span>

                            <strong>
                              {formatTime(
                                request.startAt
                              )}{" "}
                              -{" "}
                              {formatTime(
                                request.endAt
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Pay</span>

                            <strong>
                              ₹{request.pay || 0}
                            </strong>
                          </div>

                          <div>
                            <span>Applied On</span>

                            <strong>
                              {formatDate(
                                application.createdAt
                              )}
                            </strong>
                          </div>

                        </div>

                      </div>

                      {/* Action */}

                      <div className="professional-application-action">

                        {application.status ===
                          "ACCEPTED" && (
                          <Link
                            to="/professional/assignments"
                            className="secondary-button"
                          >
                            View Assignment
                          </Link>
                        )}

                        {application.status ===
                          "PENDING" && (
                          <span className="application-waiting">
                            Awaiting hospital response
                          </span>
                        )}

                        {application.status ===
                          "REJECTED" && (
                          <span className="application-rejected-text">
                            Application was rejected
                          </span>
                        )}

                        {application.status ===
                          "WITHDRAWN" && (
                          <span className="application-waiting">
                            Application withdrawn
                          </span>
                        )}

                        {application.status === "PENDING" && (
                          <button
                            className="modal-danger-button"
                            onClick={() => setWithdrawModal(application)}
                          >
                            Withdraw
                          </button>
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

      {withdrawModal && (
        <ConfirmModal
          title="Withdraw Application"
          message="Are you sure you want to withdraw this application? You will no longer be considered for this shift."
          confirmText="Withdraw"
          cancelText="Keep Application"
          onConfirm={handleWithdrawApplication}
          onCancel={() => setWithdrawModal(null)}
          loading={withdrawing}
          danger={true}
        />
      )}

    </div>
  );
}

export default ProfessionalApplications;