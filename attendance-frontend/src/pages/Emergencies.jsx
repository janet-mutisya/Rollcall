import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Search,
  Calendar,
  User,
  FileText,
  Phone
} from 'lucide-react';

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([
    {
      _id: '1',
      staff: { name: 'John Doe', serviceNumber: 'EMP001' },
      dateReported: '2025-08-10T08:30:00Z',
      emergencyDate: '2025-08-12T00:00:00Z',
      returnDate: '2025-08-14T00:00:00Z',
      reason: 'Family medical emergency - father hospitalized',
      status: 'Pending',
      approvedBy: null,
      notes: '',
      createdAt: '2025-08-10T08:30:00Z'
    },
    {
      _id: '2',
      staff: { name: 'Sarah Wilson', serviceNumber: 'EMP002' },
      dateReported: '2025-08-08T14:15:00Z',
      emergencyDate: '2025-08-09T00:00:00Z',
      returnDate: '2025-08-11T00:00:00Z',
      reason: 'Car accident - need immediate medical attention',
      status: 'Approved',
      approvedBy: { name: 'Admin Smith', serviceNumber: 'ADM001' },
      notes: 'Approved for emergency medical treatment. Get well soon.',
      createdAt: '2025-08-08T14:15:00Z'
    },
    {
      _id: '3',
      staff: { name: 'Michael Johnson', serviceNumber: 'EMP003' },
      dateReported: '2025-08-05T16:45:00Z',
      emergencyDate: '2025-08-06T00:00:00Z',
      returnDate: '2025-08-08T00:00:00Z',
      reason: 'Home flooding due to burst pipe',
      status: 'Rejected',
      approvedBy: { name: 'Admin Smith', serviceNumber: 'ADM001' },
      notes: 'Not classified as emergency. Please use regular leave process.',
      createdAt: '2025-08-05T16:45:00Z'
    },
    {
      _id: '4',
      staff: { name: 'Emily Chen', serviceNumber: 'EMP004' },
      dateReported: '2025-08-11T11:20:00Z',
      emergencyDate: '2025-08-12T00:00:00Z',
      returnDate: '2025-08-13T00:00:00Z',
      reason: 'Child injury at school - need to be at hospital',
      status: 'Pending',
      approvedBy: null,
      notes: '',
      createdAt: '2025-08-11T11:20:00Z'
    }
  ]);

  const [filteredEmergencies, setFilteredEmergencies] = useState(emergencies);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    search: '',
    dateRange: 'All'
  });
  const [actionForm, setActionForm] = useState({
    status: '',
    notes: ''
  });

  // Simulate API call to fetch emergencies
  const fetchEmergencies = async () => {
    try {
      // In real app: const response = await axios.get('/api/emergencies');
      // setEmergencies(response.data.data);
      console.log('Fetching emergencies...');
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // Filter emergencies based on search and filters
  useEffect(() => {
    let filtered = [...emergencies];

    // Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(emergency => emergency.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emergency =>
        emergency.staff.name.toLowerCase().includes(searchLower) ||
        emergency.staff.serviceNumber.toLowerCase().includes(searchLower) ||
        emergency.reason.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'All') {
      const now = new Date();
      const days = filters.dateRange === 'Last 7 days' ? 7 : 
                   filters.dateRange === 'Last 30 days' ? 30 : 0;
      
      if (days > 0) {
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(emergency => 
          new Date(emergency.dateReported) >= cutoffDate
        );
      }
    }

    setFilteredEmergencies(filtered);
  }, [emergencies, filters]);

  const handleStatusUpdate = async (emergencyId, newStatus, notes) => {
    try {
      // In real app:
      // const response = await axios.put(`/api/emergencies/${emergencyId}`, {
      //   status: newStatus,
      //   notes: notes
      // });
      
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency._id === emergencyId 
            ? { 
                ...emergency, 
                status: newStatus, 
                notes: notes,
                approvedBy: { name: 'Current Admin', serviceNumber: 'ADM001' }
              }
            : emergency
        )
      );
      
      alert(`Emergency ${newStatus.toLowerCase()} successfully`);
      setShowModal(false);
      setSelectedEmergency(null);
      setActionForm({ status: '', notes: '' });
    } catch (error) {
      console.error('Error updating emergency:', error);
      alert('Error updating emergency status');
    }
  };

  const openModal = (emergency) => {
    setSelectedEmergency(emergency);
    setActionForm({
      status: emergency.status === 'Pending' ? 'Approved' : emergency.status,
      notes: emergency.notes || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Approved': return <CheckCircle size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyLevel = (emergencyDate) => {
    const today = new Date();
    const emergency = new Date(emergencyDate);
    const diffTime = emergency.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { level: 'Past', color: 'text-gray-500' };
    if (diffDays === 0) return { level: 'Today', color: 'text-red-600 font-bold' };
    if (diffDays === 1) return { level: 'Tomorrow', color: 'text-orange-600 font-semibold' };
    if (diffDays <= 3) return { level: `${diffDays} days`, color: 'text-yellow-600' };
    return { level: `${diffDays} days`, color: 'text-blue-600' };
  };

  const pendingCount = emergencies.filter(e => e.status === 'Pending').length;
  const approvedCount = emergencies.filter(e => e.status === 'Approved').length;
  const rejectedCount = emergencies.filter(e => e.status === 'Rejected').length;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Emergency Management</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{emergencies.length}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, service number, or reason..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Time</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Staff</th>
                <th className="text-left p-4 font-semibold text-gray-700">Emergency Details</th>
                <th className="text-left p-4 font-semibold text-gray-700">Dates</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Urgency</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmergencies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No emergency requests found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredEmergencies.map((emergency) => {
                  const urgency = getUrgencyLevel(emergency.emergencyDate);
                  return (
                    <tr key={emergency._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{emergency.staff.name}</div>
                            <div className="text-sm text-gray-500">{emergency.staff.serviceNumber}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-800 line-clamp-2">{emergency.reason}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Reported: {formatDate(emergency.dateReported)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm">
                          <div><strong>Emergency:</strong> {formatDateOnly(emergency.emergencyDate)}</div>
                          {emergency.returnDate && (
                            <div><strong>Return:</strong> {formatDateOnly(emergency.returnDate)}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(emergency.status)}`}>
                          {getStatusIcon(emergency.status)}
                          {emergency.status}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`text-sm ${urgency.color}`}>
                          {urgency.level}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(emergency)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Emergency Details and Actions */}
      {showModal && selectedEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-orange-600" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">Emergency Request Details</h2>
                    <p className="text-gray-600">Request ID: {selectedEmergency._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Staff Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Staff Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <div className="font-medium">{selectedEmergency.staff.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Service Number:</span>
                    <div className="font-medium">{selectedEmergency.staff.serviceNumber}</div>
                  </div>
                </div>
              </div>

              {/* Emergency Details */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Emergency Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Reason:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded border">{selectedEmergency.reason}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Emergency Date:</span>
                      <div className="font-medium">{formatDateOnly(selectedEmergency.emergencyDate)}</div>
                    </div>
                    {selectedEmergency.returnDate && (
                      <div>
                        <span className="text-sm text-gray-600">Expected Return:</span>
                        <div className="font-medium">{formatDateOnly(selectedEmergency.returnDate)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Date Reported:</span>
                    <div className="font-medium">{formatDate(selectedEmergency.dateReported)}</div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Current Status</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${getStatusColor(selectedEmergency.status)}`}>
                  {getStatusIcon(selectedEmergency.status)}
                  {selectedEmergency.status}
                </div>
                
                {selectedEmergency.approvedBy && (
                  <div className="mt-2 text-sm text-gray-600">
                    Processed by: {selectedEmergency.approvedBy.name} ({selectedEmergency.approvedBy.serviceNumber})
                  </div>
                )}
                
                {selectedEmergency.notes && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Admin Notes:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded border">{selectedEmergency.notes}</div>
                  </div>
                )}
              </div>

              {/* Action Form */}
              {selectedEmergency.status === 'Pending' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Take Action</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Decision
                      </label>
                      <select
                        value={actionForm.status}
                        onChange={(e) => setActionForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={actionForm.notes}
                        onChange={(e) => setActionForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any notes or comments..."
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              
              {selectedEmergency.status === 'Pending' && (
                <button
                  onClick={() => handleStatusUpdate(selectedEmergency._id, actionForm.status, actionForm.notes)}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    actionForm.status === 'Approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionForm.status === 'Approved' ? 'Approve Request' : 'Reject Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyManagement;