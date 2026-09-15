import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";

function ProfessionalRequests() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [confirmation, setConfirmation] = useState(null);

  const [applyLoading, setApplyLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        requestsResponse,
        applicationsResponse,
      ] = await Promise.all([
        api.get("/requests"),
        api.get("/applications/my"),
      ]);

      setRequests(requestsResponse.data.data || []);
      setApplications(
        applicationsResponse.data.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load staffing requests:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load available shifts."
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
     Applied request IDs
  ========================================= */

  const appliedRequestIds = useMemo(() => {
    return new Set(
      applications
        .map((application) => {
          if (
            typeof application.requestId ===
            "string"
          ) {
            return application.requestId;
          }

          return application.requestId?._id;
        })
        .filter(Boolean)
    );
  }, [applications]);

  /* =========================================
     Filter options
  ========================================= */

  const roles = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.requiredRole)
          .filter(Boolean)
      ),
    ].sort();
  }, [requests]);

  const specializations = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.specialization)
          .filter(Boolean)
      ),
    ].sort();
  }, [requests]);

  const cities = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.location)
          .filter(Boolean)
      ),
    ].sort();
  }, [requests]);

  /* =========================================
     Filtering + sorting
  ========================================= */

  const filteredRequests = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered = requests.filter((request) => {
      // Only show open requests
      if (request.status !== "OPEN") {
        return false;
      }

      // Search
      if (normalizedSearch) {
        const searchableText = [
          request.department,
          request.requiredRole,
          request.specialization,
          request.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (
          !searchableText.includes(normalizedSearch)
        ) {
          return false;
        }
      }

      // Role
      if (
        roleFilter &&
        request.requiredRole !== roleFilter
      ) {
        return false;
      }

      // Specialization
      if (
        specializationFilter &&
        request.specialization !==
          specializationFilter
      ) {
        return false;
      }

      // City / location
      if (
        cityFilter &&
        request.location !== cityFilter
      ) {
        return false;
      }

      // Date
      if (dateFilter) {
        const requestDate = new Date(
          request.startAt
        );

        const selectedDate = new Date(
          `${dateFilter}T00:00:00`
        );

        const requestDateOnly =
          new Date(
            requestDate.getFullYear(),
            requestDate.getMonth(),
            requestDate.getDate()
          );

        const selectedDateOnly =
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );

        if (
          requestDateOnly.getTime() !==
          selectedDateOnly.getTime()
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return (
            new Date(a.startAt) -
            new Date(b.startAt)
          );

        case "date-desc":
          return (
            new Date(b.startAt) -
            new Date(a.startAt)
          );

        case "pay-high":
          return (
            Number(b.pay || 0) -
            Number(a.pay || 0)
          );

        case "pay-low":
          return (
            Number(a.pay || 0) -
            Number(b.pay || 0)
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
    requests,
    search,
    roleFilter,
    specializationFilter,
    cityFilter,
    dateFilter,
    sortBy,
  ]);

  /* =========================================
     Pagination
  ========================================= */

  const totalPages = Math.ceil(
    filteredRequests.length / ITEMS_PER_PAGE
  );

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    roleFilter,
    specializationFilter,
    cityFilter,
    dateFilter,
    sortBy,
  ]);

  /* =========================================
     Formatting
  ========================================= */

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

  const getAvailablePositions = (request) => {
    return Math.max(
      0,
      Number(request.positions || 0) -
        Number(request.positionsFilled || 0)
    );
  };

  /* =========================================
     Reset filters
  ========================================= */

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setSpecializationFilter("");
    setCityFilter("");
    setDateFilter("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters =
    search ||
    roleFilter ||
    specializationFilter ||
    cityFilter ||
    dateFilter ||
    sortBy !== "newest";

  /* =========================================
     Open details
  ========================================= */

  const openRequestDetails = (request) => {
    setSuccess("");
    setSelectedRequest(request);
  };

  const closeRequestDetails = () => {
    if (!applyLoading) {
      setSelectedRequest(null);
    }
  };

  /* =========================================
     Apply
  ========================================= */

  const handleApplyClick = (request) => {
    if (appliedRequestIds.has(request._id)) {
      return;
    }

    setConfirmation({
      title: "Apply for this shift?",
      message: `You are applying for the ${request.department} shift at ${request.location} on ${formatDate(
        request.startAt
      )}.`,
      confirmText: "Apply",
      request,
    });
  };

  const handleConfirmApply = async () => {
    if (!confirmation?.request) {
      return;
    }

    const request = confirmation.request;

    try {
      setApplyLoading(true);
      setError("");
      setSuccess("");

      await api.post(
        `/applications/requests/${request._id}/apply`
      );

      setConfirmation(null);
      setSelectedRequest(null);

      setSuccess(
        "Application submitted successfully."
      );

      // Refresh requests + applications
      await fetchData();
    } catch (error) {
      console.error(
        "Failed to apply for shift:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to apply for this shift."
      );

      setConfirmation(null);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading available shifts...
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
            className="sidebar-link active"
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

      {/* =====================================
          Main Content
      ===================================== */}

      <main className="dashboard-main">

        <div className="requests-page">

          {/* Header */}

          <div className="requests-header">

            <div>
              <h1>Find Shifts</h1>

              <p>
                Browse open staffing opportunities
                that match your preferences.
              </p>
            </div>

            <div className="requests-count">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1
                ? "shift"
                : "shifts"}{" "}
              available
            </div>

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
              Filters
          ================================= */}

          <div className="shift-filters">

            <div className="shift-search">

              <label htmlFor="shift-search">
                Search
              </label>

              <input
                id="shift-search"
                type="text"
                placeholder="Search department, role, specialization..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <div className="shift-filter">

              <label>Role</label>

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >
                <option value="">
                  All roles
                </option>

                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}

              </select>

            </div>

            <div className="shift-filter">

              <label>Specialization</label>

              <select
                value={specializationFilter}
                onChange={(e) =>
                  setSpecializationFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All specializations
                </option>

                {specializations.map(
                  (specialization) => (
                    <option
                      key={specialization}
                      value={specialization}
                    >
                      {specialization}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="shift-filter">

              <label>Location</label>

              <select
                value={cityFilter}
                onChange={(e) =>
                  setCityFilter(e.target.value)
                }
              >
                <option value="">
                  All locations
                </option>

                {cities.map((city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city}
                  </option>
                ))}

              </select>

            </div>

            <div className="shift-filter">

              <label>Date</label>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value)
                }
              />

            </div>

            <div className="shift-filter">

              <label>Sort by</label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="date-asc">
                  Shift date: Earliest
                </option>

                <option value="date-desc">
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
              Request List
          ================================= */}

          {paginatedRequests.length === 0 ? (

            <div className="requests-empty">

              <div className="requests-empty-icon">
                —
              </div>

              <h2>
                No shifts found
              </h2>

              <p>
                Try changing your filters or search
                criteria.
              </p>

              {hasFilters && (
                <button
                  className="secondary-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <div className="shift-list">

              {paginatedRequests.map((request) => {

                const availablePositions =
                  getAvailablePositions(request);

                const alreadyApplied =
                  appliedRequestIds.has(
                    request._id
                  );

                return (
                  <article
                    className="shift-card"
                    key={request._id}
                  >

                    <div className="shift-card-main">

                      <div className="shift-card-title">

                        <div>
                          <h2>
                            {request.department}
                          </h2>

                          <p>
                            {request.requiredRole}

                            {request.specialization
                              ? ` • ${request.specialization}`
                              : ""}
                          </p>
                        </div>

                        <span className="shift-open-badge">
                          OPEN
                        </span>

                      </div>

                      <div className="shift-card-details">

                        <div className="shift-detail">
                          <span>Date</span>

                          <strong>
                            {formatDate(
                              request.startAt
                            )}
                          </strong>
                        </div>

                        <div className="shift-detail">
                          <span>Time</span>

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

                        <div className="shift-detail">
                          <span>Location</span>

                          <strong>
                            {request.location ||
                              "-"}
                          </strong>
                        </div>

                        <div className="shift-detail">
                          <span>Pay</span>

                          <strong>
                            ₹{request.pay}
                          </strong>
                        </div>

                      </div>

                      <div className="shift-card-footer">

                        <span>
                          {availablePositions}{" "}
                          {availablePositions === 1
                            ? "position"
                            : "positions"}{" "}
                          available
                        </span>

                        {request.requiredExperience !==
                          undefined && (
                          <span>
                            {request.requiredExperience}{" "}
                            years experience required
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="shift-card-actions">

                      <button
                        className="secondary-button"
                        onClick={() =>
                          openRequestDetails(
                            request
                          )
                        }
                      >
                        View Details
                      </button>

                      {alreadyApplied ? (
                        <button
                          className="applied-button"
                          disabled
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleApplyClick(
                              request
                            )
                          }
                        >
                          Apply
                        </button>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>
          )}

          {/* =================================
              Pagination
          ================================= */}

          {totalPages > 1 && (
            <div className="shift-pagination">

              <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (page) => page - 1
                  )
                }
              >
                Previous
              </button>

              <div className="pagination-pages">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`pagination-page ${
                      currentPage === page
                        ? "pagination-page-active"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

              </div>

              <button
                className="pagination-button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) => page + 1
                  )
                }
              >
                Next
              </button>

            </div>
          )}

        </div>

      </main>

      {/* =====================================
          Request Details Modal
      ===================================== */}

      {selectedRequest && (
        <div
          className="modal-overlay"
          onClick={closeRequestDetails}
        >

          <div
            className="shift-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="shift-details-header">

              <div>
                <h2>
                  {selectedRequest.department}
                </h2>

                <p>
                  {selectedRequest.requiredRole}

                  {selectedRequest.specialization
                    ? ` • ${selectedRequest.specialization}`
                    : ""}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeRequestDetails}
              >
                ×
              </button>

            </div>

            <div className="shift-details-body">

              <div className="shift-detail-block">
                <span>Hospital</span>

                <strong>
                  {selectedRequest.hospitalId
                    ?.hospitalName ||
                    "Hospital"}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Department</span>

                <strong>
                  {selectedRequest.department}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Professional Role</span>

                <strong>
                  {selectedRequest.requiredRole}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Specialization</span>

                <strong>
                  {selectedRequest.specialization ||
                    "Not specified"}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Experience Required</span>

                <strong>
                  {
                    selectedRequest.requiredExperience
                  }{" "}
                  years
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Location</span>

                <strong>
                  {selectedRequest.location}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Start</span>

                <strong>
                  {formatDate(
                    selectedRequest.startAt
                  )}{" "}
                  •{" "}
                  {formatTime(
                    selectedRequest.startAt
                  )}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>End</span>

                <strong>
                  {formatDate(
                    selectedRequest.endAt
                  )}{" "}
                  •{" "}
                  {formatTime(
                    selectedRequest.endAt
                  )}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Pay</span>

                <strong className="shift-detail-pay">
                  ₹{selectedRequest.pay}
                </strong>
              </div>

              <div className="shift-detail-block">
                <span>Positions Available</span>

                <strong>
                  {getAvailablePositions(
                    selectedRequest
                  )}
                </strong>
              </div>

            </div>

            <div className="shift-details-actions">

              <button
                className="secondary-button"
                onClick={closeRequestDetails}
              >
                Close
              </button>

              {appliedRequestIds.has(
                selectedRequest._id
              ) ? (
                <button
                  className="applied-button"
                  disabled
                >
                  Already Applied
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={() =>
                    handleApplyClick(
                      selectedRequest
                    )
                  }
                >
                  Apply for Shift
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================
          Apply Confirmation
      ===================================== */}

      {confirmation && (
        <ConfirmModal
          title={confirmation.title}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText="Cancel"
          onConfirm={handleConfirmApply}
          onCancel={() =>
            setConfirmation(null)
          }
          loading={applyLoading}
        />
      )}

    </div>
  );
}

export default ProfessionalRequests;