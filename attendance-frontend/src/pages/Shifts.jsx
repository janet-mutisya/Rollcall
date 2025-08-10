import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminShiftManager = () => {
  const [serviceNumber, setServiceNumber] = useState("");
  const [site, setSite] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState("Day");
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/shifts", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (Array.isArray(res.data.data)) {
        setShifts(res.data.data);
      } else {
        console.warn("Expected an array but got:", res.data);
        setShifts([]);
      }
    } catch (err) {
      console.error("Error fetching shifts", err);
      setError("Failed to fetch shifts");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "/api/shifts",
        {
          serviceNumber,
          site,
          shiftDate,
          shiftType,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setShifts((prev) => [...prev, res.data.shift]);

      setServiceNumber("");
      setSite("");
      setShiftDate("");
      setShiftType("Day");
    } catch (err) {
      console.error("Error creating shift", err);
      setError(err.response?.data?.message || "Error creating shift");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Assign a Shift</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="number"
          placeholder="Service Number"
          value={serviceNumber}
          onChange={(e) => setServiceNumber(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Site/Workplace"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={shiftDate}
          onChange={(e) => setShiftDate(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <select
          value={shiftType}
          onChange={(e) => setShiftType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Day">Day</option>
          <option value="Night">Night</option>
        </select>
        <button
          type="submit"
          className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Assign Shift
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <h3 className="text-xl font-semibold mt-10 mb-4">All Shifts</h3>

      {loading ? (
        <p>Loading shifts...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Service Number</th>
                <th className="py-2 px-4 border">Site</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Type</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift._id}>
                  <td className="py-2 px-4 border">{shift.serviceNumber || "N/A"}</td>
                  <td className="py-2 px-4 border">{shift.site}</td>
                  <td className="py-2 px-4 border">
                    {new Date(shift.shiftDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">{shift.shiftType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminShiftManager;

