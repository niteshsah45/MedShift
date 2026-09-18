import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ProfessionalOnboarding() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "doctor",
    specialization: "",
    experienceYears: "",
    qualifications: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/professionals", {
        name: formData.name.trim(),
        role: formData.role,
        specialization: formData.specialization.trim(),
        experienceYears: Number(formData.experienceYears),
        qualifications: formData.qualifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        city: formData.city.trim(),
      });

      navigate("/professional/dashboard");
    } catch (err) {
      console.error("Professional onboarding failed:", err);

      setError(
        err.response?.data?.message ||
          "Failed to complete your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Complete Your Profile</h1>
          <p>
            Tell us about yourself so hospitals can find you for
            suitable shifts.
          </p>
        </div>

        {error && (
          <div className="onboarding-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Professional Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>

            <div className="form-group">
              <label>Specialization</label>

              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Experience (Years)</label>

              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                placeholder="e.g. 3"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Delhi"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Qualifications</label>

            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="e.g. MBBS, MD"
              required
            />

            <small>
              Separate multiple qualifications with commas.
            </small>
          </div>

          <button
            type="submit"
            className="primary-button onboarding-submit"
            disabled={loading}
          >
            {loading ? "Creating Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalOnboarding;