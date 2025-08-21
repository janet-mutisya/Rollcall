import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye,
  Phone,
  Mail,
  Calendar,
  FileText,
  Zap,
  Heart,
  Users,
  Shield
} from 'lucide-react';

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');

  // Emergency types configuration
  const emergencyTypes = {
    MEDICAL: { 
      priority: 'critical', 
      color: 'red', 
      icon: <Heart size={16} />,
      requiresImmediate: true,
      maxResponseTime: 30 // minutes
    },
    FAMILY: { 
      priority: 'high', 
      color: 'orange', 
      icon: <Users size={16} />,
      requiresImmediate: true,
      maxResponseTime: 60
    },
    SHIFT_COVERAGE: { 
      priority: 'high', 
      color: 'yellow', 
      icon: <Clock size={16} />,
      requiresImmediate: false,
      maxResponseTime: 120
    },
    ACCESS_REQUEST: { 
      priority: 'medium', 
      color: 'blue', 
      icon: <Shield size={16} />,
      requiresImmediate: false,
      maxResponseTime: 240
    },
    INCIDENT_REPORT: { 
      priority: 'critical', 
      color: 'red', 
      icon: <AlertTriangle size={16} />,
      requiresImmediate: true,
      maxResponseTime: 15
    }
  };

  // Sample emergency data
  useEffect(() => {
    // In real app, fetch from API
    const sampleEmergencies = [
      {
        id: 1,
        type: 'MEDICAL',
        title: 'Medical Emergency Leave Request',
        employee: {
          name: 'Sarah Johnson',
          id: 'EMP001',
          department: 'Marketing',
          phone: '+254 700 123 456',
          email: 'sarah.j@company.com'
        },
        description: 'Urgent medical procedure required for family member. Need immediate leave approval.',
        submittedAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        requiredResponse: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        status: 'pending',
        priority: 'critical',
        attachments: ['medical_certificate.pdf', 'doctor_note.pdf']
      },
      {
        id: 2,
        type: 'SHIFT_COVERAGE',
        title: 'Emergency Shift Coverage Needed',
        employee: {
          name: 'Mike Chen',
          id: 'EMP002',
          department: 'Operations',
          phone: '+254 700 789 012',
          email: 'mike.c@company.com'
        },
        description: 'Night shift supervisor called in sick. Need emergency coverage for tonight.',
        submittedAt: new Date(Date.now() - 45 * 60 * 1000),
        requiredResponse: new Date(Date.now() + 75 * 60 * 1000),
        status: 'pending',
        priority: 'high',
        shiftDetails: {
          date: '2025-08-18',
          time: '18:00 - 06:00',
          location: 'Nairobi HQ - CBD'
        }
      },
      {
        id: 3,
        type: 'INCIDENT_REPORT',
        title: 'Workplace Safety Incident',
        employee: {
          name: 'David Ochieng',
          id: 'EMP003',
          department: 'Security',
          phone: '+254 700 345 678',
          email: 'd.ochieng@company.com'
        },
        description: 'Minor workplace accident in warehouse. Employee received first aid, no serious injuries.',
        submittedAt: new Date(Date.now() - 10 * 60 * 1000),
        requiredResponse: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
        priority: 'critical',
        incidentDetails: {
          location: 'Warehouse Section B',
          time: '14:30',
          witnesses: ['John Doe', 'Jane Smith']
        }
      }
    ];
    
    setEmergencies(sampleEmergencies);
  }, []);

  // Calculate time remaining for response
  const getTimeRemaining = (requiredResponse) => {
    const now = new Date();
    const diff = requiredResponse - now;
    
    if (diff <= 0) return { expired: true, text: 'OVERDUE' };
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes % 60}m` };
    }
    return { expired: false, text: `${minutes}m` };
  };

  // Handle emergency approval/rejection
  const handleEmergencyAction = async (emergencyId, action, comments = '') => {
    setLoading(true);
    
    try {
      // In real app, make API call
      // await fetch(`/api/emergencies/${emergencyId}/action`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action, comments, adminId: getCurrentAdmin() })
      // });

      // Update local state
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === emergencyId 
            ? { 
                ...emergency, 
                status: action,
                resolvedAt: new Date(),
                adminComments: comments,
                resolvedBy: 'Current Admin' // Replace with actual admin info
              }
            : emergency
        )
      );

      // Send notifications (in real app)
      // await sendEmergencyNotification(emergencyId, action);
      
      alert(`Emergency ${action === 'approved' ? 'approved' : 'rejected'} successfully!`);
      
    } catch (error) {
      console.error('Error handling emergency action:', error);
      alert('Error processing emergency action');
    } finally {
      setLoading(false);
      setSelectedEmergency(null);
    }
  };

  // Filter emergencies
  const filteredEmergencies = emergencies.filter(emergency => {
    const matchesPriority = filterPriority === 'all' || 
      emergencyTypes[emergency.type]?.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || emergency.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  // Sort by priority and time
  const sortedEmergencies = filteredEmergencies.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[emergencyTypes[a.type]?.priority] || 999;
    const bPriority = priorityOrder[emergencyTypes[b.type]?.priority] || 999;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  const getPriorityBadge = (type) => {
    const config = emergencyTypes[type];
    if (!config) return null;
    
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[config.priority]} flex items-center gap-1`}>
        {config.icon}
        {config.priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">Emergency Management</h1>
            <div className="ml-auto flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <span className="text-sm font-medium text-gray-600">
                Real-time Emergency Response System
              </span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Handle critical emergency requests requiring immediate attention and approval.
          </p>
          
          {/* Emergency Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Critical</p>
                  <p className="text-2xl font-bold text-red-700">
                    {emergencies.filter(e => emergencyTypes[e.type]?.priority === 'critical' && e.status === 'pending').length}
                  </p>
                </div>
                <Heart className="text-red-500" size={24} />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">High Priority</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {emergencies.filter(e => emergencyTypes[e.type]?.priority === 'high' && e.status === 'pending').length}
                  </p>
                </div>
                <Clock className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-green-700">
                    {emergencies.filter(e => e.status === 'approved' || e.status === 'rejected').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{emergencies.length}</p>
                </div>
                <AlertTriangle className="text-blue-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              <AlertTriangle size={16} className="mr-1" />
              {sortedEmergencies.filter(e => e.status === 'pending').length} pending emergencies
            </div>
          </div>
        </div>

        {/* Emergency List */}
        <div className="space-y-4">
          {sortedEmergencies.map((emergency) => {
            const timeRemaining = getTimeRemaining(emergency.requiredResponse);
            const config = emergencyTypes[emergency.type];
            
            return (
              <div
                key={emergency.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 overflow-hidden ${
                  config?.priority === 'critical' 
                    ? 'border-red-500 bg-red-50' 
                    : config?.priority === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-blue-500'
                } ${timeRemaining.expired ? 'animate-pulse' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{emergency.title}</h3>
                        {getPriorityBadge(emergency.type)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          emergency.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          emergency.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {emergency.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{emergency.employee.name} ({emergency.employee.id})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Submitted {new Date(emergency.submittedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{emergency.description}</p>
                      
                      {/* Contact Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{emergency.employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span>{emergency.employee.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-semibold mb-2 ${
                        timeRemaining.expired ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {timeRemaining.expired ? '⚠️ OVERDUE' : `⏰ ${timeRemaining.text} left`}
                      </div>
                      
                      {emergency.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedEmergency(emergency)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                          >
                            <Eye size={12} />
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Details Modal */}
        {selectedEmergency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Emergency Review</h2>
                  <button
                    onClick={() => setSelectedEmergency(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Emergency Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedEmergency.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {getPriorityBadge(selectedEmergency.type)}
                    <span className="text-sm text-gray-600">
                      Response required by: {selectedEmergency.requiredResponse.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedEmergency.description}</p>
                </div>

                {/* Employee Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Employee Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedEmergency.employee.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="ml-2 font-medium">{selectedEmergency.employee.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2 font-medium">{selectedEmergency.employee.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedEmergency.employee.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {selectedEmergency.shiftDetails && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Shift Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Date:</span> {selectedEmergency.shiftDetails.date}</p>
                      <p><span className="text-gray-600">Time:</span> {selectedEmergency.shiftDetails.time}</p>
                      <p><span className="text-gray-600">Location:</span> {selectedEmergency.shiftDetails.location}</p>
                    </div>
                  </div>
                )}

                {selectedEmergency.incidentDetails && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Incident Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Location:</span> {selectedEmergency.incidentDetails.location}</p>
                      <p><span className="text-gray-600">Time:</span> {selectedEmergency.incidentDetails.time}</p>
                      <p><span className="text-gray-600">Witnesses:</span> {selectedEmergency.incidentDetails.witnesses.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedEmergency.attachments && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEmergency.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-blue-600 hover:underline cursor-pointer">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => handleEmergencyAction(selectedEmergency.id, 'approved')}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve Emergency
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleEmergencyAction(selectedEmergency.id, 'rejected', reason);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedEmergencies.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertTriangle className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emergencies</h3>
            <p className="text-gray-600">All emergency requests have been resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyManagement;