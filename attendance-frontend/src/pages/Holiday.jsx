// src/pages/HolidayAttendancePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HolidayAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [serviceNumber, setServiceNumber] = useState('');
  const [holidayId, setHolidayId] = useState('');
  const [dateWorked, setDateWorked] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        isAdmin ? '/api/holiday-attendance' : '/api/holiday-attendance/me'
      );
      setRecords(data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchHolidays = async () => {
    const { data } = await axios.get('/api/public-holidays');
    setHolidays(data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/holiday-attendance', {
        serviceNumber,
        holidayId,
        dateWorked,
      });
      fetchData();
      setServiceNumber('');
      setHolidayId('');
      setDateWorked('');
    } catch (err) {
      alert(err?.response?.data?.message || 'Error submitting record');
    }
  };

  useEffect(() => {
    fetchData();
    fetchHolidays();
  }, [isAdmin]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Holiday Attendance Records</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-6 grid gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Service Number"
            value={serviceNumber}
            onChange={(e) => setServiceNumber(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <select
            value={holidayId}
            onChange={(e) => setHolidayId(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Select Holiday</option>
            {holidays.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} – {new Date(h.date).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateWorked}
            onChange={(e) => setDateWorked(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            Mark Holiday Attendance
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              {isAdmin && <th>Staff</th>}
              <th>Holiday</th>
              <th>Date Worked</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={r._id}>
                <td>{idx + 1}</td>
                {isAdmin && (
                  <td>
                    {r.staff?.name} – {r.staff?.serviceNumber}
                  </td>
                )}
                <td>{r.holiday?.name}</td>
                <td>{new Date(r.dateWorked).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HolidayAttendancePage;
