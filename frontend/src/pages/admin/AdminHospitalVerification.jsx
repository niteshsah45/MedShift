import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";

function HospitalVerification() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/verifications/hospital/pending"
      );

      setHospitals(response.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch hospital verification requests:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load hospital verification requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!modal?.hospitalId) return;

    try {
      setActionLoading(true);

      await api.patch(
        `/verifications/hospital/${modal.hospitalId}/approve`
      );

      setModal(null);

      await fetchHospitals();
    } catch (error) {
      console.error(
        "Failed to approve hospital:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to approve hospital."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!modal?.hospitalId) return;

    try {
      setActionLoading(true);

      await api.patch(
        `/verifications/hospital/${modal.hospitalId}/reject`,
        {
          reason: modal.reason,
        }
      );

      setModal(null);

      await fetchHospitals();
    } catch (error) {
      console.error(
        "Failed to reject hospital:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reject hospital."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            className="nav-link"
          >
            Professional Verification
          </Link>

          <Link
            to="/admin/hospital-verification"
            className="nav-link active"
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
            <h1>Hospital Verification</h1>

            <p>
              Review hospitals waiting for verification.
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
              Loading hospital requests...
            </div>
          ) : hospitals.length === 0 ? (
            <div className="admin-empty-state">

              <h3>No pending hospitals</h3>

              <p>
                There are currently no hospitals waiting
                for verification.
              </p>

            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Departments</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {hospitals.map((hospital) => (

                    <tr key={hospital._id}>

                      <td>
                        <strong>
                          {hospital.hospitalName}
                        </strong>
                      </td>

                      <td>
                        {hospital.city || "-"}
                      </td>

                      <td>
                        {hospital.address || "-"}
                      </td>

                      <td>
                        {hospital.departments?.length
                          ? hospital.departments.join(", ")
                          : "-"}
                      </td>

                      <td>

                        <div className="admin-action-buttons">

                          <button
                            className="primary-button small-button"
                            onClick={() =>
                              setModal({
                                type: "approve",
                                hospitalId:
                                  hospital._id,
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
                                hospitalId:
                                  hospital._id,
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
          title="Approve Hospital"
          message="Are you sure you want to approve this hospital?"
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

            <h2>Reject Hospital</h2>

            <p>
              Provide a reason for rejecting this
              hospital.
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

export default HospitalVerification;