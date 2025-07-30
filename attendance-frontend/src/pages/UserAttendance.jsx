import React, { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, LogIn, LogOut } from "lucide-react";
import api from "../lib/api";

export default function UserAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/my");
      setRecords(res.data.data);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post("/attendance/check-in");
      alert("Checked In");
      fetchRecords();
    } catch (err) {
      alert("Check In Failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post("/attendance/check-out");
      alert("Checked Out");
      fetchRecords();
    } catch (err) {
      alert("Check Out Failed");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays /> My Attendance
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleCheckIn}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <LogIn size={18} /> Check In
          </button>
          <button
            onClick={handleCheckOut}
            className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <LogOut size={18} /> Check Out
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td>{item.status}</td>
                  <td>{item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : "-"}</td>
                  <td>{item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : "-"}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-4 text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
