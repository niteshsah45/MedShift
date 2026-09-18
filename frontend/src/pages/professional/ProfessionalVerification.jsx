import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ProfessionalVerification() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const [documentType, setDocumentType] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setDocuments(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch verification documents:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load verification documents."
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
     File selection
  ========================================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    /*
     * Basic frontend validation.
     *
     * Backend validation is still required.
     */

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PDF, JPG, and PNG files are allowed."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "File size must be 5 MB or less."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  };

  /* =========================================
     Upload
  ========================================= */

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!documentType) {
      setError(
        "Please select a document type."
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a document to upload."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "documentType",
        documentType
      );

      /*
       * IMPORTANT:
       *
       * Change "document" below only if your
       * backend multer field uses another name.
       */
      formData.append(
        "document",
        selectedFile
      );

      await api.post(
        "/verifications/professional/documents",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Document uploaded successfully. It is now pending verification."
      );

      setDocumentType("");
      setSelectedFile(null);

      /*
       * Reset file input
       */
      const fileInput =
        document.getElementById(
          "verification-document"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchDocuments();
    } catch (error) {
      console.error(
        "Failed to upload document:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to upload document."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================================
     Helpers
  ========================================= */

  const formatDocumentType = (type) => {
    switch (type) {
      case "DEGREE":
        return "Degree";

      case "MEDICAL_LICENSE":
        return "Medical License";

      case "EXPERIENCE_CERTIFICATE":
        return "Experience Certificate";

      case "IDENTITY":
        return "Identity Document";

      default:
        return type || "-";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "verification-status-approved";

      case "REJECTED":
        return "verification-status-rejected";

      case "PENDING":
      default:
        return "verification-status-pending";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "Approved";

      case "REJECTED":
        return "Rejected";

      case "PENDING":
        return "Pending Review";

      default:
        return status || "Pending";
    }
  };

  const formatFileName = (url) => {
    if (!url) return "Document";

    try {
      const parts = url.split("/");
      return parts[parts.length - 1];
    } catch {
      return "Document";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading verification documents...
      </div>
    );
  }

  const formatDate = (date) => {
  if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
            className="sidebar-link active"
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

        <div className="verification-page">

          {/* Header */}

          <div className="verification-page-header">

            <div>
              <h1>Document Verification</h1>

              <p>
                Submit your professional documents
                for verification.
              </p>
            </div>

            <Link
              to="/professional/profile"
              className="secondary-button"
            >
              View Profile
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
              Information
          ================================= */}

          <div className="verification-info">

            <div className="verification-info-icon">
              i
            </div>

            <div>
              <h3>
                Keep your documents up to date
              </h3>

              <p>
                Upload clear copies of your
                professional documents. Your documents
                will be reviewed by a MedShift
                administrator.
              </p>
            </div>

          </div>

          {/* =================================
              Upload
          ================================= */}

          <section className="verification-card">

            <div className="verification-card-header">

              <div>
                <h2>
                  Upload Document
                </h2>

                <p>
                  PDF, JPG, or PNG files up to 5 MB.
                </p>
              </div>

            </div>

            <form
              className="verification-upload-form"
              onSubmit={handleUpload}
            >

              <div className="verification-form-grid">

                <div className="form-group">

                  <label htmlFor="documentType">
                    Document Type
                  </label>

                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) =>
                      setDocumentType(
                        e.target.value
                      )
                    }
                    disabled={uploading}
                  >

                    <option value="">
                      Select document type
                    </option>

                    <option value="DEGREE">
                      Degree
                    </option>

                    <option value="MEDICAL_LICENSE">
                      Medical License
                    </option>

                    <option value="EXPERIENCE_CERTIFICATE">
                      Experience Certificate
                    </option>

                    <option value="IDENTITY">
                      Identity Document
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="verification-document">
                    Document
                  </label>

                  <input
                    id="verification-document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />

                  {selectedFile && (
                    <small className="selected-file">
                      Selected:{" "}
                      {selectedFile.name}
                    </small>
                  )}

                </div>

              </div>

              <div className="verification-upload-actions">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload Document"}
                </button>

              </div>

            </form>

          </section>

          {/* =================================
              Documents
          ================================= */}

          <section className="verification-card">

            <div className="verification-card-header">

              <div>
                <h2>
                  Submitted Documents
                </h2>

                <p>
                  Track the verification status of
                  your submitted documents.
                </p>
              </div>

              <span className="verification-document-count">
                {documents.length}{" "}
                {documents.length === 1
                  ? "document"
                  : "documents"}
              </span>

            </div>

            {documents.length === 0 ? (

              <div className="verification-empty">

                <div className="verification-empty-icon">
                  —
                </div>

                <h3>
                  No documents submitted
                </h3>

                <p>
                  Upload your professional documents
                  to start the verification process.
                </p>

              </div>

            ) : (

              <div className="verification-document-list">

                {documents.map((document) => (

                  <div
                    className="verification-document"
                    key={document._id}
                  >

                    <div className="verification-document-icon">
                      {document.documentType ===
                      "MEDICAL_LICENSE"
                        ? "L"
                        : document.documentType ===
                          "DEGREE"
                        ? "D"
                        : document.documentType ===
                          "IDENTITY"
                        ? "I"
                        : "E"}
                    </div>

                    <div className="verification-document-info">

                      <h3>
                        {formatDocumentType(
                          document.documentType
                        )}
                      </h3>

                      <p>
                        Submitted{" "}
                        {document.createdAt
                          ? formatDate(
                              document.createdAt
                            )
                          : ""}
                      </p>

                      {document.fileUrl && (
                        <span className="verification-file-name">
                          {formatFileName(
                            document.fileUrl
                          )}
                        </span>
                      )}

                      {document.status ===
                        "REJECTED" &&
                        document.rejectionReason && (
                          <div className="verification-rejection">

                            <strong>
                              Rejection reason:
                            </strong>

                            <span>
                              {
                                document.rejectionReason
                              }
                            </span>

                          </div>
                        )}

                    </div>

                    <div className="verification-document-status">

                      <span
                        className={`verification-status ${getStatusClass(
                          document.status
                        )}`}
                      >
                        {getStatusText(
                          document.status
                        )}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProfessionalVerification;