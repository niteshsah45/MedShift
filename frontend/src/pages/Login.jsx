import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      "/auth/login",
      formData
    );

    console.log("Login response:", response.data);

    const jwtToken = response.data.data.token;

    // Store token + fetch current user
    const user = await login(jwtToken);

    if (user.role === "professional") {
      try {
        await api.get("/professionals/me");

        // Profile exists
        navigate("/professional/dashboard");
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet
          navigate("/professional/onboarding");
        } else {
          throw error;
        }
      }
    } else if (user.role === "hospital") {
      try {
        await api.get("/hospitals/me");

        // Profile exists
        navigate("/hospital/dashboard");
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet
          navigate("/hospital/onboarding");
        } else {
          throw error;
        }
      }
    } else if (user.role === "admin") {
      navigate("/admin/dashboard");
    }

  } catch (error) {
    console.error("Login error:", error);

    setMessage(
      error.response?.data?.message ||
      "Login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>MedShift</h1>

        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Login to your account
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;