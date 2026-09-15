import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ProfessionalProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [professional, setProfessional] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    experienceYears: "",
    qualifications: "",
    city: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/professionals/me");

      const data = response.data.data;

      setProfessional(data);

      setFormData({
        name: data.name || "",
        role: data.role || "",
        experienceYears:
          data.experienceYears ?? "",
        qualifications:
          data.qualifications?.join(", ") || "",
        city: data.city || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: professional?.name || "",
      role: professional?.role || "",
      experienceYears:
        professional?.experienceYears ?? "",
      qualifications:
        professional?.qualifications?.join(", ") || "",
      city: professional?.city || "",
    });

    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        role: formData.role,
        experienceYears: Number(
          formData.experienceYears
        ),
        qualifications: formData.qualifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        city: formData.city.trim(),
      };

      const response = await api.patch(
        "/professionals/me",
        payload
      );

      const updatedProfessional =
        response.data.data;

      setProfessional(updatedProfessional);

      setFormData({
        name: updatedProfessional.name || "",
        role: updatedProfessional.role || "",
        experienceYears:
          updatedProfessional.experienceYears ?? "",
        qualifications:
          updatedProfessional.qualifications?.join(
            ", "
          ) || "",
        city: updatedProfessional.city || "",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getVerificationClass = () => {
    switch (professional?.verificationStatus) {
      case "APPROVED":
        return "profile-status-approved";

      case "REJECTED":
        return "profile-status-rejected";

      default:
        return "profile-status-pending";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
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
            className="sidebar-link active"
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

      {/* Main */}
      <main className="dashboard-main">

        <div className="profile-page">

          {/* Header */}
          <div className="profile-header">

            <div className="profile-header-info">

              <div className="profile-avatar">
                {professional?.name
                  ? professional.name
                      .charAt(0)
                      .toUpperCase()
                  : "P"}
              </div>

              <div>
                <h1>
                  {professional?.name ||
                    "Professional Profile"}
                </h1>

                <p>
                  Manage your professional information
                </p>
              </div>

            </div>

            {!editing && (
              <button
                className="primary-button"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            )}

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

          <div className="profile-card">

            {editing ? (

              /* ========================
                 Edit Form
              ======================== */

              <form
                className="profile-edit-form"
                onSubmit={handleSubmit}
              >

                <div className="profile-section-header">
                  <div>
                    <h2>Professional Information</h2>
                    <p>
                      Update your professional details.
                    </p>
                  </div>
                </div>

                <div className="form-grid">

                  <div className="form-group">

                    <label htmlFor="name">
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="role">
                      Professional Role
                    </label>

                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select role
                      </option>

                      <option value="doctor">
                        Doctor
                      </option>

                      <option value="nurse">
                        Nurse
                      </option>
                    </select>

                  </div>

                  {/* Specialization - READ ONLY */}

                  <div className="form-group">

                    <label htmlFor="specialization">
                      Specialization
                    </label>

                    <input
                      id="specialization"
                      type="text"
                      value={
                        professional?.specialization ||
                        ""
                      }
                      disabled
                    />

                    <small>
                      Specialization cannot be changed
                      from the profile.
                    </small>

                  </div>

                  <div className="form-group">

                    <label htmlFor="experienceYears">
                      Experience (Years)
                    </label>

                    <input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      min="0"
                      value={
                        formData.experienceYears
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="qualifications">
                      Qualifications
                    </label>

                    <input
                      id="qualifications"
                      name="qualifications"
                      type="text"
                      value={
                        formData.qualifications
                      }
                      onChange={handleChange}
                      placeholder="MBBS, MD"
                      required
                    />

                    <small>
                      Separate multiple qualifications
                      with commas.
                    </small>

                  </div>

                </div>

                <div className="profile-form-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            ) : (

              /* ========================
                 Profile View
              ======================== */

              <>

                <div className="profile-section-header">

                  <div>
                    <h2>
                      Professional Information
                    </h2>

                    <p>
                      Your professional details used
                      for shift matching.
                    </p>
                  </div>

                </div>

                <div className="profile-details">

                  <div className="profile-detail">
                    <span>Full Name</span>
                    <strong>
                      {professional?.name || "-"}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span>Professional Role</span>
                    <strong>
                      {professional?.role
                        ? professional.role
                            .charAt(0)
                            .toUpperCase() +
                          professional.role.slice(1)
                        : "-"}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span>Specialization</span>
                    <strong>
                      {professional?.specialization ||
                        "-"}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span>Experience</span>
                    <strong>
                      {professional?.experienceYears ??
                        0}{" "}
                      years
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span>City</span>
                    <strong>
                      {professional?.city || "-"}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span>Qualifications</span>

                    {professional?.qualifications
                      ?.length ? (
                      <div className="profile-departments">

                        {professional.qualifications.map(
                          (qualification, index) => (
                            <span
                              className="department-tag"
                              key={index}
                            >
                              {qualification}
                            </span>
                          )
                        )}

                      </div>
                    ) : (
                      <strong>-</strong>
                    )}

                  </div>

                </div>

                {/* Verification */}

                <div className="profile-verification">

                  <div className="profile-verification-title">
                    Verification Status
                  </div>

                  <span
                    className={`profile-status ${getVerificationClass()}`}
                  >
                    {professional?.verificationStatus ||
                      "PENDING"}
                  </span>

                  <p className="profile-verification-text">
                    Your verification status is managed
                    through the MedShift verification
                    process.
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProfessionalProfile;