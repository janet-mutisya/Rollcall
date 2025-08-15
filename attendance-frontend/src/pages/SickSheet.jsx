import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Trash2, 
  Eye, 
  Download, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  XCircle,
  Edit
} from 'lucide-react';
router-dom
import toast from 'react-hot-toast';

const SickSheet = () => {
  // const navigate = useNavigate();
  const navigate = (path) => {
    console.log('Navigate to:', path);
    // Replace with your actual navigation logic
  };
  
  // Toast notifications replacement
  const toast = {
    success: (message) => console.log('Success:', message),
    error: (message) => console.error('Error:', message)
  };
  const [sickSheets, setSickSheets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all sick sheets with pagination
  useEffect(() => {
    fetchSickSheets();
    fetchStats();
  }, [currentPage, filterStatus]);

  const fetchSickSheets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No authentication token found');
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/sick-sheets?status=${filterStatus}&page=${currentPage}&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSickSheets(data.data || []);
        setTotalPages(data.totalPages || 1);
        toast.success(`Loaded ${data.count || 0} sick sheets`);
      } else {
        toast.error(data.message || 'Failed to fetch sick sheets');
        if (data.message?.includes('unauthorized') || data.message?.includes('token')) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching sick sheets:', error);
      toast.error('Network error while fetching sick sheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sick-sheets/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSickSheetStatus = async (sheetId, status, notes = '') => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/sick-sheets/${sheetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          adminNotes: notes
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSickSheets(prev => prev.map(sheet => 
          sheet._id === sheetId ? data.data : sheet
        ));
        toast.success(`Sick sheet ${status} successfully`);
        setShowModal(false);
        setAdminNotes('');
        fetchStats();
      } else {
        toast.error(data.message || `Failed to ${status} sick sheet`);
      }
    } catch (error) {
      console.error('Error updating sick sheet:', error);
      toast.error('Network error while updating sick sheet');
    } finally {
      setUpdating(false);
    }
  };

  const deleteSickSheet = async (sheetId) => {
    if (!window.confirm('Are you sure you want to delete this sick sheet? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/sick-sheets/${sheetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSickSheets(prev => prev.filter(sheet => sheet._id !== sheetId));
        toast.success('Sick sheet deleted successfully');
        setShowModal(false);
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete sick sheet');
      }
    } catch (error) {
      console.error('Error deleting sick sheet:', error);
      toast.error('Network error while deleting sick sheet');
    } finally {
      setDeleting(false);
    }
  };

  const viewDetails = (sheet) => {
    setSelectedSheet(sheet);
    setAdminNotes(sheet.adminNotes || '');
    setShowModal(true);
  };

  const downloadAttachment = (url, employeeName) => {
    if (!url) {
      toast.error('No attachment available');
      return;
    }
    
    window.open(url, '_blank');
    toast.success('Opening attachment');
  };

  // Filter and search logic
  const filteredSheets = sickSheets.filter(sheet => {
    const matchesSearch = 
      sheet.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.user?.serviceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading sick sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <button
            onClick={() => {
              fetchSickSheets();
              fetchStats();
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Loader2 size={16} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 text-orange-600" size={36} />
            Sick Sheets Management
          </h1>
          <p className="text-gray-600 mt-2">Review and manage employee sick leave requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sheets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <FileText className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">{stats.recent || 0}</p>
            </div>
            <Calendar className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by employee name, service number, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sick Sheets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredSheets.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sick sheets found</h3>
            <p className="text-gray-500">
              {sickSheets.length === 0 
                ? "No sick sheets have been submitted yet." 
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSheets.map((sheet) => (
                  <tr key={sheet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sheet.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sheet.user?.serviceNumber || 'No Service Number'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {sheet.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-1" size={16} />
                        {formatDate(sheet.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 border ${getStatusColor(sheet.status)}`}>
                        {getStatusIcon(sheet.status)}
                        {sheet.status?.charAt(0).toUpperCase() + sheet.status?.slice(1) || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sheet.attachmentUrl ? (
                        <button
                          onClick={() => downloadAttachment(sheet.attachmentUrl, sheet.user?.name)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="mr-1" size={16} />
                          View
                        </button>
                      ) : (
                        <span className="text-orange-500 flex items-center">
                          <AlertTriangle className="mr-1" size={16} />
                          No attachment
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDetails(sheet)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => deleteSickSheet(sheet._id)}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Sick Sheet Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employee Name</label>
                    <p className="text-lg text-gray-900">{selectedSheet.user?.name || 'Unknown User'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Number</label>
                    <p className="text-lg text-gray-900">{selectedSheet.user?.serviceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg text-gray-900">{selectedSheet.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 border ${getStatusColor(selectedSheet.status)}`}>
                      {getStatusIcon(selectedSheet.status)}
                      {selectedSheet.status?.charAt(0).toUpperCase() + selectedSheet.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                    <p className="text-lg text-gray-900">{formatDate(selectedSheet.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sick Date</label>
                    <p className="text-lg text-gray-900">{formatDate(selectedSheet.date)}</p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Absence</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedSheet.reason}</p>
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Certificate</label>
                  {selectedSheet.attachmentUrl ? (
                    <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2" size={20} />
                          <span className="text-green-800">Medical certificate attached</span>
                        </div>
                        <button
                          onClick={() => downloadAttachment(selectedSheet.attachmentUrl, selectedSheet.user?.name)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <Download className="mr-2" size={16} />
                          View Attachment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center">
                        <AlertTriangle className="text-orange-500 mr-2" size={20} />
                        <span className="text-orange-800">No medical certificate provided</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {selectedSheet.adminNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-900">{selectedSheet.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Review Info */}
                {selectedSheet.reviewedBy && selectedSheet.reviewedAt && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reviewed By</label>
                      <p className="text-lg text-gray-900">{selectedSheet.reviewedBy?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                      <p className="text-lg text-gray-900">{formatDate(selectedSheet.reviewedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Status Update Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => updateSickSheetStatus(selectedSheet._id, 'approved', adminNotes)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {updating ? 'Updating...' : 'Approve'}
                    </button>
                    
                    <button
                      onClick={() => updateSickSheetStatus(selectedSheet._id, 'rejected', adminNotes)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      {updating ? 'Updating...' : 'Reject'}
                    </button>
                    
                    <button
                      onClick={() => updateSickSheetStatus(selectedSheet._id, 'pending', adminNotes)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      {updating ? 'Updating...' : 'Set Pending'}
                    </button>
                  </div>

                  {/* Admin Notes Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add notes about this decision..."
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => deleteSickSheet(selectedSheet._id)}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2" size={16} />
                        Delete Sheet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SickSheet;