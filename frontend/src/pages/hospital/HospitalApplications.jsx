
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ConfirmModal from "../../components/ConfirmModal";
import api from "../../services/api";

function HospitalApplications() {
  const [searchParams] = useSearchParams();

  const notificationApplicationId =
    searchParams.get("applicationId");

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] =
    useState("");

  const [applications, setApplications] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const [loadingRequests, setLoadingRequests] =
    useState(true);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Find which staffing request contains
   * the application from the notification.
   *
   * The current backend endpoint requires
   * requestId, so we check the hospital's
   * requests until we find the application.
   */
  const findApplicationRequest = async (
    requestData,
    applicationId
  ) => {
    if (!applicationId) {
      return null;
    }

    for (const request of requestData) {
      try {
        const response = await api.get(
          `/applications/requests/${request._id}/applications`
        );

        const applicationData = Array.isArray(
          response.data.data
        )
          ? response.data.data
          : [];

        const foundApplication =
          applicationData.find(
            (application) =>
              application._id === applicationId
          );

        if (foundApplication) {
          return request._id;
        }
      } catch (error) {
        console.error(
          `Failed to check applications for request ${request._id}:`,
          error
        );
      }
    }

    return null;
  };


  // Get hospital requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setError("");

      const response = await api.get("/requests/my");

      console.log(
        "Application page requests:",
        response.data
      );

      const requestData = Array.isArray(
        response.data.data
      )
        ? response.data.data
        : [];

      setRequests(requestData);

      if (requestData.length === 0) {
        setSelectedRequest("");
        return;
      }

      /*
       * If page was opened from a notification,
       * find the request containing that application.
       */
      if (notificationApplicationId) {
        const notificationRequestId =
          await findApplicationRequest(
            requestData,
            notificationApplicationId
          );

        if (notificationRequestId) {
          setSelectedRequest(notificationRequestId);
          return;
        }
      }

      // Normal page visit → select first request
      setSelectedRequest(requestData[0]._id);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load staffing requests."
      );
    } finally {
      setLoadingRequests(false);
    }
  };


  // Get applications for request
  const fetchApplications = async (requestId) => {
    if (!requestId) {
      setApplications([]);
      return;
    }

    try {
      setLoadingApplications(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/applications/requests/${requestId}/applications`
      );

      console.log(
        "Applications:",
        response.data
      );

      const applicationData = Array.isArray(
        response.data.data
      )
        ? response.data.data
        : [];

      setApplications(applicationData);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load applications."
      );

      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };


  useEffect(() => {
    fetchRequests();
  }, []);


  useEffect(() => {
    fetchApplications(selectedRequest);
  }, [selectedRequest]);


  /*
   * Once the applications are loaded,
   * scroll to the application opened
   * from the notification.
   */
  useEffect(() => {
    if (
      !notificationApplicationId ||
      !applications.length ||
      loadingApplications
    ) {
      return;
    }

    const applicationExists =
      applications.some(
        (application) =>
          application._id ===
          notificationApplicationId
      );

    if (!applicationExists) {
      return;
    }

    setTimeout(() => {
      const element = document.getElementById(
        `application-${notificationApplicationId}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }, [
    applications,
    loadingApplications,
    notificationApplicationId,
  ]);


  // Accept application
  const handleAccept = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/applications/${applicationId}/accept`
      );

      setSuccess(
        "Application accepted successfully."
      );

      await fetchApplications(selectedRequest);

      // Refresh requests because positionsFilled may have changed
      await fetchRequests();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to accept application."
      );
    } finally {
      setActionLoading(null);
    }
  };


  // Reject application
  const handleReject = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/applications/${applicationId}/reject`
      );

      setSuccess(
        "Application rejected."
      );

      await fetchApplications(selectedRequest);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to reject application."
      );
    } finally {
      setActionLoading(null);
    }
  };


  const getSelectedRequest = () => {
    return requests.find(
      (request) =>
        request._id === selectedRequest
    );
  };


  const getProfessional = (application) => {
    if (
      application.professionalId &&
      typeof application.professionalId === "object"
    ) {
      return application.professionalId;
    }

    return null;
  };


  const selectedRequestData =
    getSelectedRequest();


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
            className="nav-link active"
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
            <h1>Applications</h1>

            <p>
              Review healthcare professionals who
              applied to your staffing requests.
            </p>
          </div>

        </header>


        {error && (
          <div className="dashboard-error">
            <span>{error}</span>

            <button
              onClick={() => {
                setError("");
                fetchApplications(
                  selectedRequest
                );
              }}
            >
              Try Again
            </button>
          </div>
        )}


        {success && (
          <div className="application-success">
            {success}
          </div>
        )}


        {loadingRequests ? (

          <div className="dashboard-loading">
            <p>Loading requests...</p>
          </div>

        ) : requests.length === 0 ? (

          <section className="dashboard-section">

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>No staffing requests</h3>

              <p>
                Create a staffing request before
                reviewing applications.
              </p>

              <Link
                to="/hospital/requests/create"
                className="primary-button"
              >
                Create Staffing Request
              </Link>

            </div>

          </section>

        ) : (

          <>
            {/* Request selector */}
            <section className="application-request-selector">

              <div>

                <label>
                  Staffing Request
                </label>

                <select
                  value={selectedRequest}
                  onChange={(e) =>
                    setSelectedRequest(
                      e.target.value
                    )
                  }
                >

                  {requests.map((request) => (

                    <option
                      key={request._id}
                      value={request._id}
                    >
                      {request.requiredRole}
                      {" - "}
                      {request.department}
                      {" - "}
                      {new Date(
                        request.startAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </option>

                  ))}

                </select>

              </div>


              {selectedRequestData && (

                <div className="request-capacity">

                  <span>
                    Positions
                  </span>

                  <strong>
                    {selectedRequestData.positionsFilled || 0}
                    {" / "}
                    {selectedRequestData.positions}
                  </strong>

                  <span
                    className={`status-badge status-${selectedRequestData.status?.toLowerCase()}`}
                  >
                    {selectedRequestData.status}
                  </span>

                </div>

              )}

            </section>


            {/* Applications */}
            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <h2>
                    Applications
                  </h2>

                  <p>
                    {applications.length} application
                    {applications.length !== 1
                      ? "s"
                      : ""}
                  </p>

                </div>

              </div>


              {loadingApplications ? (

                <div className="dashboard-loading">
                  <p>
                    Loading applications...
                  </p>
                </div>

              ) : applications.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    👨‍⚕️
                  </div>

                  <h3>
                    No applications yet
                  </h3>

                  <p>
                    Professionals who apply for this
                    request will appear here.
                  </p>

                </div>

              ) : (

                <div className="applications-list">

                  {applications.map(
                    (application) => {

                      const professional =
                        getProfessional(
                          application
                        );

                      const isNotificationApplication =
                        application._id ===
                        notificationApplicationId;

                      return (
                        <div
                          id={`application-${application._id}`}
                          className={`application-card ${
                            isNotificationApplication
                              ? "application-card-highlight"
                              : ""
                          }`}
                          key={application._id}
                        >

                          {isNotificationApplication && (
                            <div className="notification-focus-label">
                              Opened from notification
                            </div>
                          )}

                          {/* Professional information */}
                          <div className="application-info">

                            <h3>
                              {professional?.name ||
                                "Healthcare Professional"}
                            </h3>

                            <p className="application-role">
                              {professional?.role ||
                                "Professional"}

                              {professional?.specialization &&
                                ` • ${professional.specialization}`}
                            </p>


                            <div className="application-details">

                              <span>
                                <strong>
                                  Experience:
                                </strong>{" "}
                                {professional?.experienceYears ??
                                  "—"}{" "}
                                years
                              </span>


                              {professional?.city && (
                                <span>
                                  <strong>
                                    City:
                                  </strong>{" "}
                                  {professional.city}
                                </span>
                              )}

                            </div>


                            {professional?.qualifications
                              ?.length > 0 && (

                              <div className="qualifications">

                                <strong>
                                  Qualifications:
                                </strong>

                                <span>
                                  {professional.qualifications.join(
                                    ", "
                                  )}
                                </span>

                              </div>

                            )}

                          </div>


                          {/* Application status/actions */}
                          <div className="application-actions">

                            <span
                              className={`status-badge status-${application.status?.toLowerCase()}`}
                            >
                              {application.status}
                            </span>


                            {application.status ===
                              "PENDING" && (

                              <div className="application-buttons">

                                <button
                                  className="reject-button"
                                  disabled={
                                    actionLoading ===
                                    application._id
                                  }
                                  onClick={() =>
                                    setConfirmation({
                                      type: "reject",
                                      applicationId:
                                        application._id,
                                    })
                                  }
                                >
                                  {actionLoading ===
                                  application._id
                                    ? "Processing..."
                                    : "Reject"}
                                </button>


                                <button
                                  className="accept-button"
                                  disabled={
                                    actionLoading ===
                                    application._id
                                  }
                                  onClick={() =>
                                    setConfirmation({
                                      type: "accept",
                                      applicationId:
                                        application._id,
                                    })
                                  }
                                >
                                  {actionLoading ===
                                  application._id
                                    ? "Processing..."
                                    : "Accept"}
                                </button>

                              </div>

                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

          </>

        )}


      </main>


      {/* Confirmation */}
      {confirmation && (
        <ConfirmModal
          title={
            confirmation.type === "accept"
              ? "Accept Application"
              : "Reject Application"
          }

          message={
            confirmation.type === "accept"
              ? "Are you sure you want to accept this professional? This will create an active assignment."
              : "Are you sure you want to reject this application?"
          }

          confirmText={
            confirmation.type === "accept"
              ? "Accept"
              : "Reject"
          }

          danger={
            confirmation.type === "reject"
          }

          onCancel={() => {
            setConfirmation(null);
          }}

          onConfirm={async () => {

            if (confirmation.type === "accept") {
              await handleAccept(
                confirmation.applicationId
              );
            } else {
              await handleReject(
                confirmation.applicationId
              );
            }

            setConfirmation(null);
          }}

          loading={
            actionLoading ===
            confirmation.applicationId
          }
        />
      )}

    </div>
  );
}

export default HospitalApplications;