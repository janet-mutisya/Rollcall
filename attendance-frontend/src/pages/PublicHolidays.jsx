import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, Plus, X } from 'lucide-react';

const HolidayEventCalendar = ({ isAdmin = true }) => {
  const [records, setRecords] = useState([
    {
      _id: '1',
      Name: 'New Year\'s Day',
      date: '2025-01-01',
      isPaid: true,
      type: 'public'
    },
    {
      _id: '2',
      Name: 'Independence Day',
      date: '2025-07-04',
      isPaid: true,
      type: 'public'
    },
    {
      _id: '3',
      Name: 'Company Retreat',
      date: '2025-08-15',
      isPaid: false,
      type: 'company'
    },
    {
      _id: '4',
      Name: 'Christmas Day',
      date: '2025-12-25',
      isPaid: true,
      type: 'public'
    }
  ]);
  
  const [form, setForm] = useState({
    Name: '',
    date: '',
    isPaid: true,
    type: 'public',
  });
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!form.Name || !form.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newRecord = {
      ...form,
      _id: Date.now().toString()
    };
    
    setRecords(prev => [...prev, newRecord]);
    alert('Holiday/Event created successfully!');
    setForm({ Name: '', date: '', isPaid: true, type: 'public' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this holiday/event?')) {
      setRecords(prev => prev.filter(r => r._id !== id));
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isHoliday = (day) => {
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find(r => r.date === dateString);
  };

  const filteredRecords = records.filter(
    (r) => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    }
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    
    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const holiday = isHoliday(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === selectedMonth && 
                     new Date().getFullYear() === selectedYear;
      
      days.push(
        <div
          key={day}
          className={`h-12 flex items-center justify-center text-sm cursor-pointer relative border border-gray-100 hover:bg-gray-50 ${
            isToday ? 'bg-blue-100 text-blue-800 font-bold' : ''
          } ${holiday ? 'bg-red-50' : ''}`}
          onClick={() => setSelectedDate(day)}
        >
          <span>{day}</span>
          {holiday && (
            <div className="absolute top-1 right-1 text-xs">🎉</div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-blue-600" size={32} />
          Holiday & Event Calendar
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Holiday/Event
          </button>
        )}
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-4 items-center">
        <select
          className="border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 focus:outline-none"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {monthNames.map((month, i) => (
            <option key={i} value={i}>
              {month}
            </option>
          ))}
        </select>
        <select
          className="border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 focus:outline-none"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Records List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {monthNames[selectedMonth]} Events ({filteredRecords.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecords.length === 0 ? (
              <p className="text-gray-500 italic">No events this month</p>
            ) : (
              filteredRecords.map((rec) => (
                <div key={rec._id} className="border-2 border-gray-100 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {rec.Name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(rec.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.type === 'public' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.type === 'public' ? 'Public Holiday' : 'Company Event'}
                        </span>
                        {rec.isPaid && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Double Pay
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(rec._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {isAdmin && showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Holiday/Event</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </div>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={form.Name}
                  onChange={(e) => setForm({ ...form, Name: e.target.value })}
                  className="border-2 border-gray-200 p-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </div>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border-2 border-gray-200 p-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </div>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="border-2 border-gray-200 p-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
                >
                  <option value="public">Public Holiday</option>
                  <option value="company">Company Event</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isPaid}
                    onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Double Pay</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayEventCalendar;