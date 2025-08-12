import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SickSheetAdmin from "./pages/SickSheet";
import Navbar from "./pages/Navbar";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/attendance";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from './pages/Profile';
import MarkAttendance from "./pages/markAttendance";
import AttendanceReport from './pages/attendanceReport';
import AttendanceMenu from "./pages/attendanceMenu";
import UserAttendance from "./pages/UserAttendance";
import Shift from "./pages/Shifts";
import PublicHolidays from "./pages/PublicHolidays";
import Holiday from "./pages/Holiday";
import Emergencies from "./pages/Emergencies";
import Offdays from "./pages/Offdays";
import Roles from "./pages/Roles";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen to storage changes (e.g., login/logout from other tabs)
  useEffect(() => {
    const onStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newRole = localStorage.getItem("role");
      console.log("Storage changed - Token:", !!newToken, "Role:", newRole);
      setToken(newToken);
      setRole(newRole);
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Helper guards
  const isLoggedIn = !!token;
  const isAdmin = role === "admin";

  // Debug logging
  console.log("=== APP.JSX AUTH DEBUG ===");
  console.log("Token exists:", isLoggedIn);
  console.log("Role from localStorage:", role);
  console.log("Is admin:", isAdmin);
  console.log("Current pathname:", window.location.pathname);

  // Component to debug and handle admin route access
  const AdminRoute = ({ children, routeName }) => {
    console.log(`=== ADMIN ROUTE CHECK: ${routeName} ===`);
    console.log("IsLoggedIn:", isLoggedIn);
    console.log("IsAdmin:", isAdmin);
    console.log("Role:", role);
    
    if (!isLoggedIn) {
      console.log(`Redirecting to login - not logged in`);
      return <Navigate to="/login" />;
    }
    
    if (!isAdmin) {
      console.log(`Access denied to ${routeName} - not admin. Redirecting to dashboard.`);
      // Show a brief message before redirect
      setTimeout(() => {
        alert(`Access denied: Admin role required for ${routeName}`);
      }, 100);
      return <Navigate to="/dashboard" />;
    }
    
    console.log(`Admin access granted to ${routeName}`);
    return children;
  };

  return (
    <Router>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />}
        />

        {/* Public accessible */}
        <Route path="/publicholidays" element={<PublicHolidays />} />
        <Route path="/PublicHolidays" element={<PublicHolidays />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={isLoggedIn ? <Report /> : <Navigate to="/login" />}
        />
        <Route
          path="/Report"
          element={isLoggedIn ? <Report /> : <Navigate to="/login" />}
        />
        <Route
          path="/attendance"
          element={isLoggedIn ? <UserAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/UserAttendance"
          element={isLoggedIn ? <UserAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/attendancemenu"
          element={isLoggedIn ? <AttendanceMenu /> : <Navigate to="/login" />}
        />
        <Route
          path="/attendance-actions"
          element={isLoggedIn ? <MarkAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/attendance-report"
          element={isLoggedIn ? <AttendanceReport /> : <Navigate to="/login" />}
        />
        <Route
          path="/shift"
          element={isLoggedIn ? <Shift /> : <Navigate to="/login" />}
        />
        <Route
          path="/Shifts"
          element={isLoggedIn ? <Shift /> : <Navigate to="/login" />}
        />

        {/* Dashboard Navigation Routes - TEMPORARY: NO ADMIN CHECKS FOR TESTING */}
        <Route
          path="/SickSheet"
          element={isLoggedIn ? <SickSheetAdmin /> : <Navigate to="/login" />}
        />
        <Route
          path="/Holiday"
          element={isLoggedIn ? <Holiday /> : <Navigate to="/login" />}
        />
        <Route
          path="/Emergencies"
          element={
            <AdminRoute routeName="Emergencies">
              <Emergencies />
            </AdminRoute>
          }
        />
        <Route
          path="/Offdays"
          element={
            <AdminRoute routeName="Off Days">
              <Offdays />
            </AdminRoute>
          }
        />
        <Route
          path="/Roles"
          element={
            <AdminRoute routeName="Role Management">
              <Roles />
            </AdminRoute>
          }
        />

        {/* Admin only - Alternative routes */}
        <Route
          path="/admin/attendance"
          element={
            <AdminRoute routeName="Admin Attendance">
              <Attendance />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sick-sheets"
          element={
            <AdminRoute routeName="Admin Sick Sheets">
              <SickSheetAdmin />
            </AdminRoute>
          }
        />

        {/* Catch all */}
        <Route
          path="*"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}