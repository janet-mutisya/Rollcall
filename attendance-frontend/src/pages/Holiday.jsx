import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, Search, Filter, Download, Eye } from 'lucide-react';

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, attended, off
  const [showDetails, setShowDetails] = useState(false);

  // Fetch holidays and attendance data
  useEffect(() => {
    fetchHolidays();
    fetchAllHolidayAttendance();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/public-holidays', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHolidays(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  // Fetch all holiday attendance records
  const fetchAllHolidayAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/holiday-attendance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching holiday attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHolidaySelect = (holidayId) => {
    setSelectedHoliday(holidayId);
    setShowDetails(!!holidayId);
  };

  // Filter attendance data for selected holiday
  const getFilteredAttendanceForHoliday = () => {
    if (!selectedHoliday) return [];
    
    return attendanceData.filter(record => {
      const matchesHoliday = record.holiday._id === selectedHoliday;
      const matchesSearch = record.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.staff.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesHoliday && matchesSearch;
    });
  };

  const filteredAttendance = getFilteredAttendanceForHoliday();
  
  // Only people who worked during holidays are recorded, so all records = double pay eligible
  const attendedCount = filteredAttendance.length;
  const selectedHolidayData = holidays.find(h => h._id === selectedHoliday);
  const holidayName = selectedHolidayData?.name || 'Selected Holiday';

  const exportToCSV = () => {
    const selectedHol = holidays.find(h => h._id === selectedHoliday);
    if (!selectedHol || !filteredAttendance.length) return;

    const headers = ['Service Number', 'Name', 'Date Worked', 'Holiday', 'Double Pay Status', 'Payment Status'];
    const csvData = filteredAttendance.map(record => [
      record.staff.serviceNumber,
      record.staff.name,
      new Date(record.dateWorked).toLocaleDateString(),
      record.holiday.name,
      'Eligible',
      record.isPaid ? 'Paid' : 'Pending'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holiday_double_pay_${selectedHol.name.replace(/\\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Holiday Attendance & Double Pay</h1>
          </div>
          <p className="text-gray-600">
            Track staff who worked during holidays and calculate double pay eligibility. 
            Only staff who attended during holidays receive double pay.
          </p>
        </div>

        {/* Holiday Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Holiday</h2>
          <select
            value={selectedHoliday}
            onChange={(e) => handleHolidaySelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a holiday...</option>
            {holidays.map(holiday => (
              <option key={holiday._id} value={holiday._id}>
                {holiday.name} - {new Date(holiday.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {showDetails && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Staff Who Worked</p>
                    <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
                    <p className="text-xs text-gray-500">During {holidayName}</p>
                  </div>
                  <Clock className="text-green-400" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Double Pay Eligible</p>
                    <p className="text-2xl font-bold text-purple-600">{attendedCount}</p>
                    <p className="text-xs text-gray-500">All who worked</p>
                  </div>
                  <DollarSign className="text-purple-400" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Holiday</p>
                    <p className="text-lg font-bold text-blue-600">{holidayName}</p>
                    <p className="text-xs text-gray-500">
                      {selectedHolidayData ? new Date(selectedHolidayData.date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Calendar className="text-blue-400" size={24} />
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or service number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Staff</option>
                    <option value="attended">Attended (Double Pay)</option>
                    <option value="off">Had Off Day</option>
                  </select>
                  
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Staff Who Worked During Holiday (Double Pay Eligible)
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredAttendance.length} staff eligible for double pay)
                  </span>
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading attendance data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Worked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Holiday
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Double Pay Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendance.map((record, index) => (
                        <tr key={record._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.staff.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Service No: {record.staff.serviceNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(record.dateWorked).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{record.holiday.name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(record.holiday.date).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Eligible
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.isPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredAttendance.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                      <p>No staff worked during this holiday.</p>
                      <p className="text-sm mt-2">Only staff who worked during holidays appear here and are eligible for double pay.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {filteredAttendance.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-green-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-green-100 text-sm">Staff Who Worked</p>
                    <p className="text-2xl font-bold">{attendedCount}</p>
                    <p className="text-green-100 text-xs">During {holidayName}</p>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Double Pay Eligible</p>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-green-100 text-xs">All staff who worked</p>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Total Double Pay</p>
                    <p className="text-2xl font-bold">{attendedCount} staff</p>
                    <p className="text-green-100 text-xs">Payroll calculation</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Holiday;