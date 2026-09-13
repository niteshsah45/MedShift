import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function HospitalProfile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    hospitalName: "",
    address: "",
    city: "",
    departments: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/hospitals/me");

      console.log("Hospital profile:", response.data);

      const hospital = response.data.data;

      setProfile(hospital);

      setFormData({
        hospitalName: hospital.hospitalName || "",
        address: hospital.address || "",
        city: hospital.city || "",
        departments: hospital.departments
          ? hospital.departments.join(", ")
          : "",
      });
    } catch (error) {
      console.error(
        "Failed to fetch hospital profile:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load hospital profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updateData = {
        hospitalName: formData.hospitalName,
        address: formData.address,
        city: formData.city,
        departments: formData.departments
          .split(",")
          .map((department) => department.trim())
          .filter(Boolean),
      };

      const response = await api.patch(
        "/hospitals/me",
        updateData
      );

      console.log(
        "Hospital profile updated:",
        response.data
      );

      setSuccess(
        "Hospital profile updated successfully."
      );

      setEditing(false);

      await fetchProfile();
    } catch (error) {
      console.error(
        "Failed to update hospital profile:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update hospital profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      hospitalName: profile.hospitalName || "",
      address: profile.address || "",
      city: profile.city || "",
      departments: profile.departments
        ? profile.departments.join(", ")
        : "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h2>MedShift</h2>
            <span>Hospital Portal</span>
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-loading">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

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
            className="nav-link"
          >
            Assignments
          </Link>

          <Link
            to="/hospital/profile"
            className="nav-link active"
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


      {/* Main Content */}
      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>
            <h1>Hospital Profile</h1>

            <p>
              Manage your hospital information.
            </p>
          </div>

          {!editing && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
            >
              Edit Profile
            </button>
          )}

        </div>


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}


        <section className="profile-card">

          <div className="profile-section">

            <div className="profile-section-header">
              <h2>Hospital Information</h2>

              {profile?.verificationStatus && (
                <span
                  className={`status-badge status-${profile.verificationStatus.toLowerCase()}`}
                >
                  {profile.verificationStatus}
                </span>
              )}
            </div>


            {editing ? (

              <form onSubmit={handleSave}>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Hospital Name
                    </label>

                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      required
                    />
                  </div>


                  <div className="form-group">
                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>


                <div className="form-group">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Departments
                  </label>

                  <input
                    type="text"
                    name="departments"
                    placeholder="Emergency, Cardiology, ICU"
                    value={formData.departments}
                    onChange={handleChange}
                  />

                  <small>
                    Separate departments with commas.
                  </small>
                </div>


                <div className="form-actions">

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

              <div className="profile-details">

                <div className="profile-detail">
                  <span>Hospital Name</span>
                  <strong>
                    {profile?.hospitalName || "-"}
                  </strong>
                </div>


                <div className="profile-detail">
                  <span>City</span>
                  <strong>
                    {profile?.city || "-"}
                  </strong>
                </div>


                <div className="profile-detail">
                  <span>Address</span>
                  <strong>
                    {profile?.address || "-"}
                  </strong>
                </div>


                <div className="profile-detail">
                  <span>Departments</span>

                  <strong>
                    {profile?.departments?.length
                      ? profile.departments.join(", ")
                      : "-"}
                  </strong>
                </div>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default HospitalProfile;