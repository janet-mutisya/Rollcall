import React, { useState, useEffect } from 'react';
import { Upload, FileText, Clock, CheckCircle, XCircle, Calendar, User, Trash2 } from 'lucide-react';

const StaffSickSheet = () => {
  const [sickSheets, setSickSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    attachment: null
  });

  // Fetch user's sick sheets
  const fetchMySickSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sick-sheets/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSickSheets(data.data);
      }
    } catch (error) {
      console.error('Error fetching sick sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit new sick sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      alert('Please provide a reason for your sick leave');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      submitData.append('reason', formData.reason);
      
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      const response = await fetch('/api/sick-sheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        alert('Sick sheet submitted successfully!');
        setFormData({ reason: '', attachment: null });
        document.getElementById('attachment').value = '';
        fetchMySickSheets();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error submitting sick sheet');
      }
    } catch (error) {
      console.error('Error submitting sick sheet:', error);
      alert('Error submitting sick sheet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only images, PDFs, and Word documents are allowed');
        e.target.value = '';
        return;
      }

      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchMySickSheets();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sick Leave Request</h1>
        <p className="text-gray-600">Submit and track your sick leave requests</p>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Sick Sheet</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Sick Leave *
            </label>
            <textarea
              id="reason"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide details about your illness or medical condition..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
              Medical Certificate/Document (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="attachment"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="attachment"
                      type="file"
                      className="sr-only"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 5MB</p>
                {formData.attachment && (
                  <p className="text-sm text-green-600 font-medium">
                    Selected: {formData.attachment.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !formData.reason.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Submit Sick Sheet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* My Sick Sheets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Sick Sheets</h2>
        </div>

        <div className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading your sick sheets...
            </div>
          ) : sickSheets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No sick sheets submitted yet</p>
              <p className="text-sm">Your submitted sick sheets will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sickSheets.map((sheet) => (
                <div key={sheet._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 border ${getStatusColor(sheet.status)}`}>
                          {getStatusIcon(sheet.status)}
                          {sheet.status?.charAt(0).toUpperCase() + sheet.status?.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Submitted {formatDate(sheet.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Reason:</h3>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {sheet.reason}
                        </p>
                      </div>

                      {sheet.attachmentUrl && (
                        <div className="mb-3">
                          <a
                            href={sheet.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FileText className="h-4 w-4" />
                            View Attachment
                          </a>
                        </div>
                      )}

                      {sheet.adminNotes && (
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</h3>
                          <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md border border-blue-200">
                            {sheet.adminNotes}
                          </p>
                        </div>
                      )}

                      {sheet.reviewedBy && sheet.reviewedAt && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Reviewed by {sheet.reviewedBy.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(sheet.reviewedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {sheet.status === 'pending' && (
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                          Awaiting Review
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSickSheet;