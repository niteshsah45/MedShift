import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Notifications() {
  const navigate = useNavigate();
  const { user,logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/my");

      console.log("Notifications:", response.data);

      setNotifications(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  /*
   * Handles clicking a notification.
   *
   * The destination depends on:
   * 1. Notification type
   * 2. Current user's role
   */
  const handleNotificationClick = async (
    notification
  ) => {
    // Mark unread notification as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (!notification.relatedId) {
      return;
    }

    switch (notification.type) {
      /*
       * Hospital receives this when
       * a professional applies.
       *
       * relatedId = application._id
       */
      case "NEW_APPLICATION":
        if (user?.role === "hospital") {
          navigate(
            `/hospital/applications?applicationId=${notification.relatedId}`
          );
        }
        break;

      /*
       * Professional receives this when
       * hospital accepts the application.
       *
       * relatedId = assignment._id
       */
      case "APPLICATION_ACCEPTED":
        if (user?.role === "professional") {
          navigate(
            `/professional/assignments?assignmentId=${notification.relatedId}`
          );
        }
        break;

      /*
       * Professional receives this when
       * hospital rejects the application.
       *
       * relatedId = application._id
       */
      case "APPLICATION_REJECTED":
        if (user?.role === "professional") {
          navigate(
            `/professional/applications`
          );
        }
        break;

      /*
       * Assignment notifications can be
       * received by both roles.
       *
       * relatedId = assignment._id
       */
      case "ASSIGNMENT_COMPLETED":
      case "ASSIGNMENT_CANCELLED":
      case "SHIFT_REMINDER":
        if (user?.role === "professional") {
          navigate(
            `/professional/assignments?assignmentId=${notification.relatedId}`
          );
        } else if (user?.role === "hospital") {
          navigate(
            `/hospital/assignments?assignmentId=${notification.relatedId}`
          );
        }
        break;

      /*
       * Verification notifications are
       * currently sent to professionals.
       *
       * relatedId = professional._id
       */
      case "VERIFICATION_APPROVED":
      case "VERIFICATION_REJECTED":
        if (user?.role === "professional") {
          navigate("/professional/verification");
        } else if (user?.role === "hospital") {
          navigate("/hospital/profile");
        }
        break;

      default:
        break;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "NEW_APPLICATION":
        return "New Application";

      case "APPLICATION_ACCEPTED":
        return "Application Accepted";

      case "APPLICATION_REJECTED":
        return "Application Rejected";

      case "ASSIGNMENT_COMPLETED":
        return "Assignment Completed";

      case "ASSIGNMENT_CANCELLED":
        return "Assignment Cancelled";

      case "VERIFICATION_APPROVED":
        return "Verification Approved";

      case "VERIFICATION_REJECTED":
        return "Verification Rejected";

      case "SHIFT_REMINDER":
        return "Shift Reminder";

      default:
        return "Notification";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  /*
   * Decide which portal is being used.
   */
  const isProfessional =
    user?.role === "professional";

  const isHospital =
    user?.role === "hospital";

  if (loading) {
    return (
      <div className="dashboard">

        <aside className="sidebar">
          <div className="sidebar-logo">
            <h2>MedShift</h2>

            <span>
              {isProfessional
                ? "Professional Portal"
                : "Hospital Portal"}
            </span>
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-loading">
            Loading notifications...
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
  <div className="sidebar-logo">
    <h2>MedShift</h2>

    <span>
      {user?.role === "professional"
        ? "Professional Portal"
        : "Hospital Portal"}
    </span>
  </div>

  <nav className="sidebar-nav">

    {/* Professional Navigation */}
    {user?.role === "professional" && (
      <>
        <Link
          to="/professional/dashboard"
          className="nav-link"
        >
          Dashboard
        </Link>

        <Link
          to="/professional/requests"
          className="nav-link"
        >
          Find Shifts
        </Link>

        <Link
          to="/professional/applications"
          className="nav-link"
        >
          My Applications
        </Link>

        <Link
          to="/professional/assignments"
          className="nav-link"
        >
          My Assignments
        </Link>

        <Link
          to="/notifications"
          className="nav-link active"
        >
          Notifications
        </Link>

        <Link
          to="/professional/profile"
          className="nav-link"
        >
          Profile
        </Link>

        <Link
          to="/professional/verification"
          className="nav-link"
        >
          Verification
        </Link>
      </>
    )}

    {/* Hospital Navigation */}
    {user?.role === "hospital" && (
      <>
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
          className="nav-link active"
        >
          Notifications
        </Link>
      </>
    )}

  </nav>
      <div className="sidebar-bottom">
      <button
        className="logout-button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
</aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-content">

        <div className="notifications-header">

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated about your staffing
              activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              className="secondary-button"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              {markingAll
                ? "Marking..."
                : "Mark All as Read"}
            </button>
          )}

        </div>


        {/* UNREAD COUNT */}

        {unreadCount > 0 && (
          <div className="notification-count">
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {/* NOTIFICATIONS */}

        <section className="notifications-card">

          {notifications.length === 0 ? (

            <div className="notification-empty">

              <h3>No notifications</h3>

              <p>
                You don't have any notifications yet.
              </p>

            </div>

          ) : (

            <div className="notification-list">

              {notifications.map((notification) => (

                <div
                  key={notification._id}
                  className={`notification-item ${
                    notification.isRead
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >

                  <div className="notification-icon">
                    {notification.isRead
                      ? "✓"
                      : "!"}
                  </div>


                  <div className="notification-content">

                    <div className="notification-top">

                      <h3>
                        {notification.title ||
                          getNotificationTitle(
                            notification.type
                          )}
                      </h3>

                      {!notification.isRead && (
                        <span className="notification-new">
                          New
                        </span>
                      )}

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <div className="notification-bottom">

                      <span>
                        {formatDate(
                          notification.createdAt
                        )}
                      </span>

                      {!notification.isRead && (
                        <button
                          className="notification-read-button"
                          onClick={(e) => {
                            e.stopPropagation();

                            markAsRead(
                              notification._id
                            );
                          }}
                        >
                          Mark as read
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Notifications;