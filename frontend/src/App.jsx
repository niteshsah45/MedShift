import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalRequests from "./pages/hospital/HospitalRequests";
import CreateStaffingRequest from "./pages/hospital/CreateStaffingRequest";
import HospitalApplications from "./pages/hospital/HospitalApplications";
import HospitalAssignments from "./pages/hospital/HospitalAssignments";
import HospitalProfile from "./pages/hospital/HospitalProfile";
import Notifications from "./pages/Notifications";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />
       
        <Route
          path="/hospital/dashboard"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/requests"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital/requests/create"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <CreateStaffingRequest />
            </ProtectedRoute>
          }
        />
          <Route
            path="/hospital/applications"
            element={
              <ProtectedRoute allowedRoles={["hospital"]}>
                <HospitalApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/assignments"
            element={
              <ProtectedRoute allowedRoles={["hospital"]}>
                <HospitalAssignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/profile"
            element={
              <ProtectedRoute allowedRoles={["hospital"]}>
                <HospitalProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "hospital",
                  "professional",
                ]}
              >
                <Notifications />
              </ProtectedRoute>
            }
          />

        <Route
          path="/professional/dashboard"
          element={
            <ProtectedRoute allowedRoles={["professional"]}>
              <h1>Professional Dashboard</h1>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <h1>Admin Dashboard</h1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={<h1>Unauthorized</h1>}
        />


        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;