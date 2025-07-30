import React, { useState, useEffect } from "react";
import {
  markHolidayAttendance,
  getAllHolidayAttendance,
  getMyHolidayAttendance,
} from "../lib/api";
import api from "../lib/api";
import HolidayAttendanceList from "../components/HolidayAttendance/HolidayAttendanceList";
import HolidayAttendanceCard from "../components/HolidayAttendance/HolidayAttendanceCard";

export default function HolidayAttendance() {
  const [holidays, setHolidays] = useState([]);
  const [holidayId, setHolidayId] = useState("");
  const [dateWorked, setDateWorked] = useState("");
  const [myRecords, setMyRecords] = useState([]);

  useEffect(() => {
    // Fetch public holidays
    const fetchHolidays = async () => {
      const res = await api.get("/public-holidays");
      setHolidays(res.data.data);
    };

    const fetchMyRecords = async () => {
      const res = await getMyHolidayAttendance();
      setMyRecords(res.data);
    };

    fetchHolidays();
    fetchMyRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await markHolidayAttendance({ holidayId, dateWorked });
      alert("Holiday attendance recorded");
      setHolidayId("");
      setDateWorked("");
    } catch (err) {
      alert("Error recording attendance");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Mark Holiday Attendance</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label>Holiday:</label>
          <select
            className="border p-2 w-full"
            value={holidayId}
            onChange={(e) => setHolidayId(e.target.value)}
            required
          >
            <option value="">Select a holiday</option>
            {holidays.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({new Date(h.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date Worked:</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={dateWorked}
            onChange={(e) => setDateWorked(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">My Holiday Attendance</h3>
      <ul className="space-y-2">
        {myRecords.map((record) => (
          <li key={record._id} className="bg-gray-100 p-2 rounded">
            Worked on <strong>{record.holiday.name}</strong> (
            {new Date(record.dateWorked).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
