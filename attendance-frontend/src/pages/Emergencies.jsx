// src/pages/AdminEmergencies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your actual backend URL and auth token if needed
    axios
      .get("/api/emergencies/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or your auth method
        },
      })
      .then((res) => {
        setEmergencies(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error fetching emergencies");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading emergencies...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Admin - All Emergencies</h1>

      {emergencies.length === 0 ? (
        <p>No emergencies found.</p>
      ) : (
        <div className="space-y-4">
          {emergencies.map((e) => (
            <div
              key={e._id}
              className="bg-white p-4 rounded shadow border-l-4"
              style={{
                borderColor:
                  e.status === "Pending"
                    ? "orange"
                    : e.status === "Approved"
                    ? "green"
                    : "red",
              }}
            >
              <h2 className="text-xl font-semibold">
                {e.reason} — <span className="italic">{e.status}</span>
              </h2>
              <p>
                <strong>Emergency Date:</strong>{" "}
                {new Date(e.emergencyDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Reported By:</strong> {e.staff?.name || "N/A"} (Service #
                {e.staff?.serviceNumber || "N/A"})
              </p>
              <p>
                <strong>Date Reported:</strong>{" "}
                {new Date(e.dateReported).toLocaleString()}
              </p>
              {e.approvedBy && (
                <p>
                  <strong>Approved By:</strong> {e.approvedBy.name} (Service #
                  {e.approvedBy.serviceNumber})
                </p>
              )}
              {e.notes && (
                <p>
                  <strong>Notes:</strong> {e.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEmergencies;
