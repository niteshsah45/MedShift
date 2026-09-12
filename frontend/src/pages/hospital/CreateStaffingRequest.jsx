import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";

import api from "../../services/api";

function CreateStaffingRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    department: "",
    requiredRole: "",
    specialization: "",
    requiredExperience: "",
    startAt: "",
    endAt: "",
    pay: "",
    positions: "1",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic frontend validation
    if (
      new Date(formData.startAt) >=
      new Date(formData.endAt)
    ) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        department: formData.department,
        requiredRole: formData.requiredRole,
        specialization:
          formData.specialization || undefined,
        requiredExperience: Number(
          formData.requiredExperience
        ),
        startAt: new Date(
          formData.startAt
        ).toISOString(),
        endAt: new Date(
          formData.endAt
        ).toISOString(),
        pay: Number(formData.pay),
        positions: Number(formData.positions),
        location: formData.location,
      };

      const response = await api.post(
        "/requests",
        requestData
      );

      console.log(
        "Staffing request created:",
        response.data
      );

      setSuccess(
        "Staffing request created successfully."
      );

      // Give the user a moment to see success
      setTimeout(() => {
        navigate("/hospital/requests");
      }, 700);

    } catch (error) {
      console.error(
        "Failed to create staffing request:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create staffing request."
      );
    } finally {
      setLoading(false);
    }
  };

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
                className="nav-link active"
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
                className="nav-link"
            >
                Notifications
            </Link>

        </nav>

      </aside>


      {/* Main */}
      <main className="dashboard-content">

        <div className="form-page-header">

          <div>
            <h1>Create Staffing Request</h1>

            <p>
              Add the details for the healthcare
              professional you need.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/hospital/requests")
            }
          >
            Back to Requests
          </button>

        </div>


        <section className="form-card">

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


          <form onSubmit={handleSubmit}>

            {/* Basic information */}
            <div className="form-section">

              <h2>Staffing Details</h2>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Emergency"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Required Role
                  </label>

                  <select
                    name="requiredRole"
                    value={formData.requiredRole}
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


                <div className="form-group">
                  <label>
                    Specialization
                  </label>

                  <input
                    type="text"
                    name="specialization"
                    placeholder="e.g. Cardiology"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group">
                  <label>
                    Required Experience (years)
                  </label>

                  <input
                    type="number"
                    name="requiredExperience"
                    min="0"
                    placeholder="e.g. 2"
                    value={
                      formData.requiredExperience
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

            </div>


            {/* Shift */}
            <div className="form-section">

              <h2>Shift Details</h2>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Start Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    name="startAt"
                    value={formData.startAt}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    End Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    name="endAt"
                    value={formData.endAt}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Number of Positions
                  </label>

                  <input
                    type="number"
                    name="positions"
                    min="1"
                    value={formData.positions}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Pay
                  </label>

                  <input
                    type="number"
                    name="pay"
                    min="0"
                    placeholder="e.g. 5000"
                    value={formData.pay}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

            </div>


            {/* Location */}
            <div className="form-section">

              <h2>Location</h2>

              <div className="form-group">

                <label>
                  Shift Location
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Main Hospital, Emergency Ward"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Actions */}
            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate("/hospital/requests")
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Request"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default CreateStaffingRequest;