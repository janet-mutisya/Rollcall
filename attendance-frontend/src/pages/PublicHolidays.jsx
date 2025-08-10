import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const HolidayEventCalendar = ({ isAdmin }) => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    Name: '',
    date: '',
    isPaid: true,
    type: 'public', // 'public' or 'company'
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get('/api/holidays-events');
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/holidays-events', form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Holiday/Event created');
      setForm({ Name: '', date: '', isPaid: true, type: 'public' });
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert('Error creating holiday/event');
    }
  };

  const tileContent = ({ date }) => {
    const match = records.find(
      (r) => new Date(r.date).toDateString() === date.toDateString()
    );
    return match ? (
      <div className="text-red-600 text-xs font-bold">🎉</div>
    ) : null;
  };

  const filteredRecords = records.filter(
    (r) => new Date(r.date).getMonth() === selectedMonth
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-md space-y-6">
      <h1 className="text-2xl font-bold">Holiday & Event Calendar</h1>

      {/* Month Filter */}
      <select
        className="border p-2 rounded"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i} value={i}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>

      {/* Calendar View */}
      <Calendar
        tileContent={tileContent}
        className="border rounded-md"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Records List */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Logged Holidays/Events</h2>
          <ul className="space-y-3">
            {filteredRecords.map((rec) => (
              <li key={rec._id} className="border p-3 rounded">
                <div className="font-medium">
                  {rec.Name} ({rec.type})
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(rec.date).toLocaleDateString()} —{' '}
                  {rec.isPaid ? (
                    <span className="text-green-600">Double Pay</span>
                  ) : (
                    <span className="text-gray-500">Unpaid</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Create Form */}
        {isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-4 rounded-md shadow space-y-4"
          >
            <h2 className="text-lg font-semibold">Add Holiday/Event</h2>
            <input
              type="text"
              placeholder="Name"
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="public">Public Holiday</option>
              <option value="company">Company Event</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
              />
              <span>Double Pay</span>
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default HolidayEventCalendar;
