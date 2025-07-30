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

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/attendance" element={<UserAttendance />} />
        <Route path="/attendanceMenu" element={<AttendanceMenu />} />
        <Route path="/attendance-actions" element={<MarkAttendance />} />
        <Route path="/attendance-report" element={<AttendanceReport />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}




