import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";

function ProfessionalVerification() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/verifications/professional/pending"
      );

      setDocuments(response.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch professional documents:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load professional verification requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!modal?.documentId) return;

    try {
      setActionLoading(true);

      await api.patch(
        `/verifications/professional/${modal.documentId}/approve`
      );

      setModal(null);

      await fetchDocuments();
    } catch (error) {
      console.error(
        "Failed to approve document:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to approve document."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!modal?.documentId) return;

    try {
      setActionLoading(true);

      await api.patch(
        `/verifications/professional/${modal.documentId}/reject`,
        {
          reason: modal.reason,
        }
      );

      setModal(null);

      await fetchDocuments();
    } catch (error) {
      console.error(
        "Failed to reject document:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reject document."
      );
    } finally {
      setActionLoading(false);
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

  return (
    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>MedShift</h2>
          <span>Admin Portal</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/admin/dashboard"
            className="nav-link"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/professional-verification"
            className="nav-link active"
          >
            Professional Verification
          </Link>

          <Link
            to="/admin/hospital-verification"
            className="nav-link"
          >
            Hospital Verification
          </Link>

        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </aside>


      {/* Main */}

      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>
            <h1>Professional Verification</h1>

            <p>
              Review professional documents submitted
              for verification.
            </p>
          </div>

        </div>


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        <section className="admin-table-card">

          {loading ? (
            <div className="dashboard-loading">
              Loading verification requests...
            </div>
          ) : documents.length === 0 ? (
            <div className="admin-empty-state">
              <h3>No pending documents</h3>

              <p>
                There are currently no professional
                documents waiting for verification.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Professional</th>
                    <th>Document</th>
                    <th>Submitted</th>
                    <th>Document</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {documents.map((document) => (

                    <tr key={document._id}>

                      <td>
                        <strong>
                          {document.professionalId?.name ||
                            "Professional"}
                        </strong>
                      </td>

                      <td>
                        {document.documentType}
                      </td>

                      <td>
                        {formatDate(
                          document.createdAt
                        )}
                      </td>

                      <td>
                        {document.fileUrl ? (
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="document-link"
                          >
                            View Document
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <div className="admin-action-buttons">

                          <button
                            className="primary-button small-button"
                            onClick={() =>
                              setModal({
                                type: "approve",
                                documentId:
                                  document._id,
                              })
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="danger-outline-button"
                            onClick={() =>
                              setModal({
                                type: "reject",
                                documentId:
                                  document._id,
                                reason: "",
                              })
                            }
                          >
                            Reject
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>


      {/* Approve Modal */}

      {modal?.type === "approve" && (
        <ConfirmModal
          title="Approve Document"
          message="Are you sure you want to approve this professional document?"
          confirmText="Approve"
          cancelText="Cancel"
          onConfirm={handleApprove}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}


      {/* Reject Modal */}

      {modal?.type === "reject" && (
        <div className="modal-overlay">

          <div className="confirm-modal">

            <h2>Reject Document</h2>

            <p>
              Provide a reason for rejecting this
              document.
            </p>

            <textarea
              className="reject-reason-input"
              value={modal.reason}
              onChange={(e) =>
                setModal((current) => ({
                  ...current,
                  reason: e.target.value,
                }))
              }
              placeholder="Enter rejection reason"
              rows="4"
            />

            <div className="confirm-modal-actions">

              <button
                className="secondary-button"
                onClick={() => setModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className="modal-danger-button"
                onClick={handleReject}
                disabled={
                  actionLoading ||
                  !modal.reason.trim()
                }
              >
                {actionLoading
                  ? "Rejecting..."
                  : "Reject"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ProfessionalVerification;