import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock,
  Users,
  MapPin,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";

const AdminShiftManager = () => {
  const [serviceNumber, setServiceNumber] = useState("");
  const [site, setSite] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState("Day");
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterShiftType, setFilterShiftType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  
  // Bulk assignment states
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkServiceNumbers, setBulkServiceNumbers] = useState("");
  
  // Edit mode
  const [editingShift, setEditingShift] = useState(null);
  
  const [stats, setStats] = useState({
    totalShifts: 0,
    dayShifts: 0,
    nightShifts: 0,
    uniqueEmployees: 0,
    sites: []
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // Get current shift for context
  const getCurrentShift = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  };

  const getShiftTimeRange = (shiftType) => {
    return shiftType === 'Day' ? '06:00 - 18:00' : '18:00 - 06:00';
  };

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
        updateStats(res.data.data);
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

  const updateStats = (shiftsData) => {
    const totalShifts = shiftsData.length;
    const dayShifts = shiftsData.filter(s => s.shiftType === 'Day').length;
    const nightShifts = shiftsData.filter(s => s.shiftType === 'Night').length;
    const uniqueEmployees = new Set(shiftsData.map(s => s.serviceNumber)).size;
    const sites = [...new Set(shiftsData.map(s => s.site))];

    setStats({
      totalShifts,
      dayShifts,
      nightShifts,
      uniqueEmployees,
      sites
    });
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Filter shifts based on search and filter criteria
  useEffect(() => {
    let filtered = [...shifts];

    if (searchTerm) {
      filtered = filtered.filter(shift => 
        shift.serviceNumber?.toString().includes(searchTerm) ||
        shift.site?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSite) {
      filtered = filtered.filter(shift => shift.site === filterSite);
    }

    if (filterShiftType) {
      filtered = filtered.filter(shift => shift.shiftType === filterShiftType);
    }

    if (filterDate) {
      filtered = filtered.filter(shift => 
        new Date(shift.shiftDate).toDateString() === new Date(filterDate).toDateString()
      );
    }

    setFilteredShifts(filtered);
  }, [shifts, searchTerm, filterSite, filterShiftType, filterDate]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const validateShift = (serviceNum, siteVal, dateVal) => {
    if (!serviceNum || !siteVal || !dateVal) {
      return "All fields are required";
    }

    // Check if service number is valid
    if (!/^\d+$/.test(serviceNum)) {
      return "Service number must contain only numbers";
    }

    // Check if date is not in the past (for new shifts)
    const shiftDate = new Date(dateVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (shiftDate < today && !editingShift) {
      return "Cannot assign shifts for past dates";
    }

    return null;
  };

  const checkShiftConflicts = async (serviceNum, dateVal, shiftTypeVal) => {
    // Check if employee already has a shift on this date
    const existingShift = shifts.find(shift => 
      shift.serviceNumber?.toString() === serviceNum.toString() &&
      new Date(shift.shiftDate).toDateString() === new Date(dateVal).toDateString() &&
      shift._id !== editingShift?._id
    );

    if (existingShift) {
      return `Employee ${serviceNum} already has a ${existingShift.shiftType} shift on ${new Date(dateVal).toLocaleDateString()}`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      // Validate form
      const validationError = validateShift(serviceNumber, site, shiftDate);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Check for conflicts
      const conflictError = await checkShiftConflicts(serviceNumber, shiftDate, shiftType);
      if (conflictError) {
        setError(conflictError);
        return;
      }

      if (editingShift) {
        // Update existing shift
        const res = await axios.put(
          `/api/shifts/${editingShift._id}`,
          { serviceNumber, site, shiftDate, shiftType },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );

        setShifts(prev => prev.map(shift => 
          shift._id === editingShift._id ? res.data.shift : shift
        ));
        setSuccess("Shift updated successfully!");
        setEditingShift(null);
      } else {
        // Create new shift
        const res = await axios.post(
          "/api/shifts",
          { serviceNumber, site, shiftDate, shiftType },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );

        setShifts(prev => [...prev, res.data.shift]);
        setSuccess("Shift assigned successfully!");
      }

      // Reset form
      setServiceNumber("");
      setSite("");
      setShiftDate("");
      setShiftType("Day");

    } catch (err) {
      console.error("Error with shift operation", err);
      setError(err.response?.data?.message || "Error processing shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      const serviceNumbers = bulkServiceNumbers
        .split('\n')
        .map(num => num.trim())
        .filter(num => num);

      if (serviceNumbers.length === 0) {
        setError("Please enter at least one service number");
        return;
      }

      const validationError = validateShift(serviceNumbers[0], site, shiftDate);
      if (validationError && !serviceNumbers[0]) {
        setError("All fields are required for bulk assignment");
        return;
      }

      const promises = serviceNumbers.map(async (serviceNum) => {
        const conflictError = await checkShiftConflicts(serviceNum, shiftDate, shiftType);
        if (conflictError) {
          console.warn(conflictError);
          return null;
        }

        return axios.post(
          "/api/shifts",
          { serviceNumber: serviceNum, site, shiftDate, shiftType },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
      const failed = results.length - successful;

      if (successful > 0) {
        setSuccess(`Successfully assigned ${successful} shifts${failed > 0 ? `, ${failed} failed due to conflicts` : '!'}`);
        fetchShifts(); // Refresh the list
        setBulkServiceNumbers("");
        setSite("");
        setShiftDate("");
      } else {
        setError("No shifts were assigned. Check for conflicts or validation errors.");
      }

    } catch (err) {
      console.error("Error with bulk assignment", err);
      setError("Error processing bulk assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setServiceNumber(shift.serviceNumber?.toString() || "");
    setSite(shift.site);
    setShiftDate(new Date(shift.shiftDate).toISOString().split('T')[0]);
    setShiftType(shift.shiftType);
    clearMessages();
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
    setServiceNumber("");
    setSite("");
    setShiftDate("");
    setShiftType("Day");
    clearMessages();
  };

  const handleDelete = async (shiftId) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      await axios.delete(`/api/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setShifts(prev => prev.filter(shift => shift._id !== shiftId));
      setSuccess("Shift deleted successfully!");
    } catch (err) {
      console.error("Error deleting shift", err);
      setError("Failed to delete shift");
    }
  };

  const exportShifts = () => {
    const csvContent = [
      ['Service Number', 'Site', 'Date', 'Shift Type', 'Time Range'],
      ...filteredShifts.map(shift => [
        shift.serviceNumber || 'N/A',
        shift.site,
        new Date(shift.shiftDate).toLocaleDateString(),
        shift.shiftType,
        getShiftTimeRange(shift.shiftType)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentShift = getCurrentShift();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Manager</h1>
            <p className="text-gray-600">Assign and manage employee work shifts</p>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentShift === 'day' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {currentShift === 'day' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-semibold">
              Current: {currentShift === 'day' ? 'Day' : 'Night'} Shift
            </span>
            <span className="text-sm">({getShiftTimeRange(currentShift === 'day' ? 'Day' : 'Night')})</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800">{stats.totalShifts}</p>
              <p className="text-gray-600 text-sm">Total Shifts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sun className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800">{stats.dayShifts}</p>
              <p className="text-gray-600 text-sm">Day Shifts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Moon className="text-indigo-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800">{stats.nightShifts}</p>
              <p className="text-gray-600 text-sm">Night Shifts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800">{stats.uniqueEmployees}</p>
              <p className="text-gray-600 text-sm">Employees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="text-red-600 mr-3" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="text-green-600 mr-3" size={20} />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingShift ? 'Edit Shift' : 'Assign New Shift'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                bulkMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Users size={16} />
              <span>Bulk Mode</span>
            </button>
            {editingShift && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {!bulkMode ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Number</label>
              <input
                type="number"
                placeholder="Enter service number"
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site/Workplace</label>
              <input
                type="text"
                placeholder="Enter workplace location"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label>
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Day">Day Shift (06:00 - 18:00)</option>
                <option value="Night">Night Shift (18:00 - 06:00)</option>
              </select>
            </div>
            
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting && <RefreshCw className="animate-spin" size={16} />}
                <span>{editingShift ? 'Update Shift' : 'Assign Shift'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site/Workplace</label>
                <input
                  type="text"
                  placeholder="Enter workplace location"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Day">Day Shift (06:00 - 18:00)</option>
                  <option value="Night">Night Shift (18:00 - 06:00)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Numbers (one per line)
              </label>
              <textarea
                placeholder="Enter service numbers, one per line:&#10;12345&#10;12346&#10;12347"
                value={bulkServiceNumbers}
                onChange={(e) => setBulkServiceNumbers(e.target.value)}
                required
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting && <RefreshCw className="animate-spin" size={16} />}
              <span>Assign Bulk Shifts</span>
            </button>
          </form>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Service number or site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sites</option>
              {stats.sites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
            <select
              value={filterShiftType}
              onChange={(e) => setFilterShiftType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Shifts</option>
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterSite("");
                setFilterShiftType("");
                setFilterDate("");
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              Clear
            </button>
            <button
              onClick={exportShifts}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-1"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            All Shifts ({filteredShifts.length})
          </h3>
          <button
            onClick={fetchShifts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin mr-2" size={24} />
            <span>Loading shifts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Service Number</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Site</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Shift Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Time Range</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShifts.map((shift) => {
                  const shiftDate = new Date(shift.shiftDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPast = shiftDate < today;
                  const isToday = shiftDate.toDateString() === today.toDateString();
                  
                  return (
                    <tr key={shift._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {shift.serviceNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{shift.site}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {shiftDate.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {shift.shiftType === 'Day' ? (
                            <Sun className="text-yellow-600" size={16} />
                          ) : (
                            <Moon className="text-blue-600" size={16} />
                          )}
                          <span className={shift.shiftType === 'Day' ? 'text-yellow-700' : 'text-blue-700'}>
                            {shift.shiftType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {getShiftTimeRange(shift.shiftType)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isPast 
                            ? 'bg-gray-100 text-gray-700' 
                            : isToday 
                            ? 'bg-green-100 text-green-700 animate-pulse' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isPast ? 'Completed' : isToday ? 'Today' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(shift)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit shift"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(shift._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete shift"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredShifts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Clock className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No shifts found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {shifts.length === 0 
                    ? "Start by assigning your first shift above" 
                    : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shift Schedule Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Schedule Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Shifts */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={18} />
              Today's Shifts
            </h4>
            {(() => {
              const today = new Date().toDateString();
              const todayShifts = shifts.filter(shift => 
                new Date(shift.shiftDate).toDateString() === today
              );
              
              return todayShifts.length > 0 ? (
                <div className="space-y-2">
                  {todayShifts.slice(0, 5).map(shift => (
                    <div key={shift._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {shift.shiftType === 'Day' ? (
                          <Sun className="text-yellow-600" size={14} />
                        ) : (
                          <Moon className="text-blue-600" size={14} />
                        )}
                        <span className="text-sm font-medium">{shift.serviceNumber}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {shift.site} • {shift.shiftType}
                      </div>
                    </div>
                  ))}
                  {todayShifts.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{todayShifts.length - 5} more shifts today
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No shifts scheduled for today</p>
              );
            })()}
          </div>

          {/* Upcoming Week */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Calendar className="mr-2 text-green-600" size={18} />
              This Week
            </h4>
            {(() => {
              const today = new Date();
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              
              const weekShifts = shifts.filter(shift => {
                const shiftDate = new Date(shift.shiftDate);
                return shiftDate >= today && shiftDate <= weekEnd;
              });
              
              const dayShifts = weekShifts.filter(s => s.shiftType === 'Day').length;
              const nightShifts = weekShifts.filter(s => s.shiftType === 'Night').length;
              
              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Shifts:</span>
                    <span className="font-bold text-gray-800">{weekShifts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Sun className="mr-1 text-yellow-600" size={12} />
                      Day Shifts:
                    </span>
                    <span className="font-bold text-yellow-700">{dayShifts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Moon className="mr-1 text-blue-600" size={12} />
                      Night Shifts:
                    </span>
                    <span className="font-bold text-blue-700">{nightShifts}</span>
                  </div>
                  {weekShifts.length === 0 && (
                    <p className="text-gray-500 text-sm">No shifts scheduled for this week</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <Clock className="mr-2" size={20} />
          Shift Integration Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Dashboard Integration:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Shifts sync with attendance dashboard</li>
              <li>• Real-time shift status updates</li>
              <li>• Automatic late detection (06:45/18:45)</li>
              <li>• Location-based shift assignments</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Bulk shift assignments</li>
              <li>• Conflict detection</li>
              <li>• CSV export functionality</li>
              <li>• Advanced filtering & search</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShiftManager;