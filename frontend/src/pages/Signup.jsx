import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Signup() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const response = await api.post(
        "/auth/register",
        formData
      );

      console.log(
        "Signup response:",
        response.data
      );

      setMessage(
        "Account created successfully! You can now login."
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Signup failed. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>MedShift</h1>

        <h2>Create Your Account</h2>

        <p className="auth-subtitle">
          Join MedShift today
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            {/* <option value="">
              Select your role
            </option> */}

            <option value="hospital">
              Hospital
            </option>

            <option value="professional">
              Healthcare Professional
            </option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;