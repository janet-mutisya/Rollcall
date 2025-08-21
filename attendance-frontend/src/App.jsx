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
import UserDashboard from "./pages/userDashboard";
import AdminApproval from "./pages/adminApproval";
import { Toaster } from "react-hot-toast";

export default function App() {
  /** Get token, role, and approvalStatus from storage */
  const getStoredAuth = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const rawRole = localStorage.getItem("role") || sessionStorage.getItem("role");
    const role = rawRole ? rawRole.toLowerCase() : null;
    const approvalStatus = localStorage.getItem("approvalStatus") || sessionStorage.getItem("approvalStatus");
    return { token, role, approvalStatus };
  };

  const [auth, setAuth] = useState(getStoredAuth());

  /** Sync auth across tabs */
  useEffect(() => {
    const onStorageChange = () => setAuth(getStoredAuth());
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Flags
  const isLoggedIn = !!auth.token;
  const isAdmin = auth.role === "admin";
  const isApprovedUser = auth.role === "user" && auth.approvalStatus === "approved";
  const isPendingUser = auth.role === "user" && auth.approvalStatus !== "approved";

  /** Admin route guard */
  const AdminRoute = ({ children, routeName }) => {
    if (!isLoggedIn) return <Navigate to="/login" />;
    if (!isAdmin) {
      alert(`Access denied: Admin role required for ${routeName}`);
      return <Navigate to={isApprovedUser ? "/user-dashboard" : "/user-dashboard"} />;
    }
    return children;
  };

  /** Default redirect after login */
  const getDefaultRoute = () => {
    if (isAdmin) return "/dashboard";
    if (isApprovedUser) return "/user-dashboard";
    if (isPendingUser) return "/user-dashboard"; // still user-dashboard, but can restrict features inside
    return "/login";
  };

  return (
    <Router>
      {/* ✅ Pass props to Navbar */}
      <Navbar role={auth.role} approvalStatus={auth.approvalStatus} />

      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to={getDefaultRoute()} /> : <Login />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to={getDefaultRoute()} /> : <Signup />} />

        {/* Public accessible */}
        <Route path="/publicholidays" element={<PublicHolidays />} />
        <Route path="/PublicHolidays" element={<PublicHolidays />} />

        {/* Default landing (decides based on role & approval) */}
        <Route path="/" element={isLoggedIn ? <Navigate to={getDefaultRoute()} /> : <Navigate to="/login" />} />

        {/* Admin dashboard */}
        <Route path="/dashboard" element={isLoggedIn && isAdmin ? <Dashboard /> : <Navigate to={getDefaultRoute()} />} />

        {/* User dashboard */}
        <Route path="/user-dashboard" element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" />} />

        {/* Common User routes */}
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/reports" element={isLoggedIn ? <Report /> : <Navigate to="/login" />} />
        <Route path="/Report" element={isLoggedIn ? <Report /> : <Navigate to="/login" />} />
        <Route path="/UserAttendance" element={isLoggedIn ? <UserAttendance /> : <Navigate to="/login" />} />
        <Route path="/attendancemenu" element={isLoggedIn ? <AttendanceMenu /> : <Navigate to="/login" />} />
        <Route path="/attendance-actions" element={isLoggedIn ? <MarkAttendance /> : <Navigate to="/login" />} />
        <Route path="/attendance-report" element={isLoggedIn ? <AttendanceReport /> : <Navigate to="/login" />} />

        {/* Admin Only Routes */}
        <Route path="/SickSheet" element={<AdminRoute routeName="Sick Sheets"><SickSheetAdmin /></AdminRoute>} />
        <Route path="/Holiday" element={<AdminRoute routeName="Manage Holidays"><Holiday /></AdminRoute>} />
        <Route path="/Emergencies" element={<AdminRoute routeName="Emergencies"><Emergencies /></AdminRoute>} />
        <Route path="/Offdays" element={<AdminRoute routeName="Off Days"><Offdays /></AdminRoute>} />
        <Route path="/Roles" element={<AdminRoute routeName="Role Management"><Roles /></AdminRoute>} />
        <Route path="/Shifts" element={<AdminRoute routeName="Assign Shifts"><Shift /></AdminRoute>} />
        <Route path="/attendance" element={<AdminRoute routeName="All Attendance"><Attendance /></AdminRoute>} />
        <Route path="/user-approvals" element={<AdminRoute routeName="User Approvals"><AdminApproval /></AdminRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
}
