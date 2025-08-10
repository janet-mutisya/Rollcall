import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

import { Toaster } from "react-hot-toast";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen to storage changes (e.g., login/logout from other tabs)
  useEffect(() => {
    const onStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Helper guards
  const isLoggedIn = !!token;
  const isAdmin = role === "admin";

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
          path="/attendance"
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

        {/* Admin only */}
        <Route
          path="/admin/attendance"
          element={
            isLoggedIn && isAdmin ? (
              <Attendance />
            ) : (
              <Navigate to={isLoggedIn ? "/dashboard" : "/login"} />
            )
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
