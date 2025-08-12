import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminOffDays() {
  const [offdays, setOffdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ date: '', reason: '', status: '', notes: '' });

  useEffect(() => {
    fetchOffdays();
  }, []);

  const fetchOffdays = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/offdays', { withCredentials: true });
      setOffdays(res.data.data);
    } catch (err) {
      setError('Failed to fetch offdays');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (offday) => {
    setEditId(offday._id);
    setEditData({
      date: offday.date.slice(0, 10), // ISO date string, trim time
      reason: offday.reason,
      status: offday.status,
      notes: offday.notes || '',
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ date: '', reason: '', status: '', notes: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`/api/offdays/${id}`, editData, { withCredentials: true });
      fetchOffdays();
      setEditId(null);
    } catch (err) {
      alert('Failed to update offday');
    }
  };

  const handleCancelOffday = async (id) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;

    try {
      await axios.put(`/api/offdays/${id}/cancel`, { cancellationReason: reason }, { withCredentials: true });
      fetchOffdays();
    } catch (err) {
      alert('Failed to cancel offday');
    }
  };

  if (loading) return <p>Loading offdays...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin OffDays Management</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Staff Name</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Notes</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offdays.map((offday) => (
            <tr key={offday._id} className="hover:bg-gray-50">
              <td className="border p-2">{offday.staff?.name || 'Unknown'}</td>
              <td className="border p-2">
                {editId === offday._id ? (
                  <input
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleChange}
                    className="border rounded p-1"
                  />
                ) : (
                  new Date(offday.date).toLocaleDateString()
                )}
              </td>
              <td className="border p-2">
                {editId === offday._id ? (
                  <input
                    type="text"
                    name="reason"
                    value={editData.reason}
                    onChange={handleChange}
                    className="border rounded p-1"
                  />
                ) : (
                  offday.reason
                )}
              </td>
              <td className="border p-2">
                {editId === offday._id ? (
                  <select name="status" value={editData.status} onChange={handleChange} className="border rounded p-1">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  offday.status
                )}
              </td>
              <td className="border p-2">
                {editId === offday._id ? (
                  <input
                    type="text"
                    name="notes"
                    value={editData.notes}
                    onChange={handleChange}
                    className="border rounded p-1"
                  />
                ) : (
                  offday.notes || '-'
                )}
              </td>
              <td className="border p-2 space-x-2">
                {editId === offday._id ? (
                  <>
                    <button
                      onClick={() => handleSave(offday._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(offday)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelOffday(offday._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Cancel Offday
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {offdays.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4">
                No offdays found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
