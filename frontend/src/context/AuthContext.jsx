import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // Get logged-in user from backend
  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);

      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Runs when application starts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);

    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      setUser(response.data.user);

      return response.data.user;
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);

      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};