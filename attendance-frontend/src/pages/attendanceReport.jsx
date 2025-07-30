import React, { useEffect, useState } from 'react';
import { getAllAttendance } from '../lib/api';

export default function AttendanceReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await getAllAttendance();
        if (res.success) {
          setRecords(res.data);
        } else {
          setMessage('Failed to fetch attendance records');
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setMessage('Server error fetching records');
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  if (loading) return <p className="text-center p-4">Loading attendance records...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Attendance Report</h1>

        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Staff Name</th>
                <th className="px-4 py-2 border">Service Number</th>
                <th className="px-4 py-2 border">Site</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Check Out</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec._id} className="text-center">
                    <td className="px-4 py-2 border">{rec.staff?.name}</td>
                    <td className="px-4 py-2 border">{rec.staff?.serviceNumber}</td>
                    <td className="px-4 py-2 border">{rec.shift?.site}</td>
                    <td className="px-4 py-2 border">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(rec.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {rec.checkOutTime
                        ? new Date(rec.checkOutTime).toLocaleTimeString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border">{rec.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center">
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
