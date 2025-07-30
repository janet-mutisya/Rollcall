import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Report() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function checkRoleAndFetch() {
      try {
        // 1. Fetch user profile
        const profileRes = await api.get("/me");
        setUserRole(profileRes.data.role);

        if (profileRes.data.role !== "admin") {
          alert("Access denied. Admins only.");
          navigate("/dashboard");
          return;
        }

        // 2. Fetch attendance data if admin
        const res = await api.get("/attendance/all");
        console.log("Attendance API response:", res.data);
        const attendanceData = res.data.data || [];
        setAttendance(attendanceData);
      } catch (err) {
        console.error("Error fetching attendance or user profile", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    checkRoleAndFetch();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Report</h1>

      {loading ? (
        <p>Loading...</p>
      ) : attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Site</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((entry) => (
                <tr key={entry._id} className="border-t">
                  <td className="px-4 py-2">{entry.staff?.name || "N/A"}</td>
                  <td className="px-4 py-2">{entry.shift?.site || "N/A"}</td>
                  <td className="px-4 py-2">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
