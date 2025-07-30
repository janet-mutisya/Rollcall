import React, { useState, useEffect } from 'react';
//import { markAttendance, markCheckout, getAllShifts } from '../lib/api';
//import React, { useState, useEffect } from 'react';
import { markAttendance, markCheckout, getAllShifts } from '../lib/api';

export default function MarkAttendance() {
  const [shiftId, setShiftId] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [message, setMessage] = useState('');
  const [shifts, setShifts] = useState([]);
  const [disableCheckIn, setDisableCheckIn] = useState(false);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const res = await getAllShifts();
        if (res.success) {
          setShifts(res.data);
        }
      } catch (err) {
        console.error('Error fetching shifts:', err);
      }
    }
    fetchShifts();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await markAttendance({ shiftId, checkInTime });
      setMessage(res.message || 'Check-in successful');
      setDisableCheckIn(true);
    } catch (err) {
      console.error('Check-in failed:', err);
      setMessage('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await markCheckout({ shiftId });
      setMessage(res.message || 'Check-out successful');
    } catch (err) {
      console.error('Check-out failed:', err);
      setMessage('Check-out failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Attendance Actions</h1>

        {message && <p className="text-center text-green-600 mb-4">{message}</p>}

        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Shift</label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Shift --</option>
            {shifts.map((shift) => (
              <option key={shift._id} value={shift._id}>
                {shift.site} | {shift.shiftDate} | {shift.shiftTime}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Check-In Time</label>
          <input
            type="datetime-local"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleCheckIn}
          disabled={disableCheckIn}
          className={`w-full py-2 rounded mb-2 ${
            disableCheckIn
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {disableCheckIn ? 'Checked In' : 'Mark Check-In'}
        </button>

        <button
          onClick={handleCheckOut}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        >
          Mark Check-Out
        </button>
      </div>
    </div>
  );
}
