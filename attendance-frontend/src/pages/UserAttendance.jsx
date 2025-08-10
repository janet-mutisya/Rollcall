import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function UserAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("You must login first");
      return;
    }

    async function fetchAttendance() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/attendance/my", {
          headers: { Authorization: token },
        });
        setAttendance(res.data.attendance);
        setShift(res.data.shift);
      } catch (error) {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [token]);

  const handleCheckIn = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        {},
        { headers: { Authorization: token } }
      );
      toast.success("Checked in successfully");
      // refresh attendance info
      const res = await axios.get("http://localhost:5000/api/attendance/my", {
        headers: { Authorization: token },
      });
      setAttendance(res.data.attendance);
    } catch (error) {
      toast.error("Check in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/check-out",
        {},
        { headers: { Authorization: token } }
      );
      toast.success("Checked out successfully");
      // refresh attendance info
      const res = await axios.get("http://localhost:5000/api/attendance/my", {
        headers: { Authorization: token },
      });
      setAttendance(res.data.attendance);
    } catch (error) {
      toast.error("Check out failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading your attendance...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Attendance</h2>

      {shift ? (
        <div>
          <p>
            <strong>Today's Shift:</strong> {shift.startTime} - {shift.endTime}
          </p>
          <p>
            <strong>Status:</strong> {shift.status}
          </p>
        </div>
      ) : (
        <p>No shift assigned for today.</p>
      )}

      <div className="mt-4 space-y-2">
        <button
          disabled={!!attendance?.checkInTime || actionLoading}
          onClick={handleCheckIn}
          className={`w-full py-2 rounded ${
            attendance?.checkInTime ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {attendance?.checkInTime ? "Checked In" : "Check In"}
        </button>

        <button
          disabled={!attendance?.checkInTime || !!attendance?.checkOutTime || actionLoading}
          onClick={handleCheckOut}
          className={`w-full py-2 rounded ${
            attendance?.checkOutTime || !attendance?.checkInTime
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white`}
        >
          {attendance?.checkOutTime ? "Checked Out" : "Check Out"}
        </button>
      </div>

      <div className="mt-4 bg-gray-100 p-4 rounded">
        <p>
          <strong>Check In Time:</strong>{" "}
          {attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : "Not checked in yet"}
        </p>
        <p>
          <strong>Check Out Time:</strong>{" "}
          {attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : "Not checked out yet"}
        </p>
        <p>
          <strong>Attendance Status:</strong> {attendance?.status || "N/A"}
        </p>
      </div>
    </div>
  );
}
