// Attendance.jsx
import React, { useEffect, useState } from 'react';
import { getMyAttendance, checkIn, checkOut } from '../lib/api';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [checkStatus, setCheckStatus] = useState(''); 

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance();
      if (res.success) {
        setAttendance(res.data);
      } else {
        setMessage(res.message || 'Failed to load attendance');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setMessage('Server error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await checkIn();
      setCheckStatus('Checked in successfully!');
      fetchAttendance();
    } catch (err) {
      setCheckStatus('Check-in failed. You may have already checked in.');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await checkOut();
      setCheckStatus('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      setCheckStatus('Check-out failed. You may not have checked in yet.');
    }
  };

  if (loading) {
    return <p className="text-center p-4">Loading attendance data...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">My Attendance Records</h1>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleCheckIn}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Check Out
          </button>
        </div>

        {checkStatus && (
          <p className="text-center text-blue-600 mb-4">{checkStatus}</p>
        )}

        {message && (
          <p className="text-red-500 text-center mb-4">{message}</p>
        )}

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Check In Time</th>
                <th className="px-4 py-2 border">Check Out Time</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(attendance) && attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="text-center">
                    <td className="px-4 py-2 border">
                      {new Date(record.checkInTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString()
                        : 'Not checked out'}
                    </td>
                    <td className="px-4 py-2 border">{record.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

