import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function HospitalOnboarding() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: "",
    address: "",
    city: "",
    departments: "",
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
      await api.post("/hospitals", {
        hospitalName: formData.hospitalName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        departments: formData.departments
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      navigate("/hospital/dashboard");
    } catch (err) {
      console.error("Hospital onboarding failed:", err);

      setError(
        err.response?.data?.message ||
          "Failed to complete your hospital profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Set Up Your Hospital</h1>

          <p>
            Complete your hospital profile before you start
            creating staffing requests.
          </p>
        </div>

        {error && (
          <div className="onboarding-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hospital Name</label>

            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              placeholder="Enter hospital name"
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter hospital address"
              rows="3"
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

          <div className="form-group">
            <label>Departments</label>

            <input
              type="text"
              name="departments"
              value={formData.departments}
              onChange={handleChange}
              placeholder="e.g. Emergency, ICU, Cardiology"
              required
            />

            <small>
              Separate multiple departments with commas.
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

export default HospitalOnboarding;