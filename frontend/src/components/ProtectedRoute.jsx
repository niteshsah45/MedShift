import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  // Still checking /auth/me
  if (loading) {
    return <div>Loading...</div>;
  }

  // No JWT
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // JWT exists but role is not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;