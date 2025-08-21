import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User, 
  Hash,
  Phone,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminUserApproval = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUser, setProcessingUser] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('/api/admin/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch pending users');
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approve) => {
    try {
      setProcessingUser(userId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: approve })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the user from pending list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        
        // Show success message
        alert(`User ${approve ? 'approved' : 'rejected'} successfully!`);
      } else {
        setError(data.message || `Failed to ${approve ? 'approve' : 'reject'} user`);
      }
    } catch (err) {
      console.error('Error processing user approval:', err);
      setError('Network error. Please try again.');
    } finally {
      setProcessingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          User Approval Management
        </h1>
        <p className="text-gray-600 mt-2">Review and approve pending user registrations</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All user registrations have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-yellow-400">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {user.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Pending
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span>Service #: {user.serviceNumber}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Applied: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <span className="font-medium">Requested Role:</span> {user.role || 'User'}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApproval(user.id, true)}
                    disabled={processingUser === user.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    {processingUser === user.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => handleApproval(user.id, false)}
                    disabled={processingUser === user.id}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button 
          onClick={fetchPendingUsers}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Refresh List
        </Button>
      </div>
    </div>
  );
};

export default AdminUserApproval;