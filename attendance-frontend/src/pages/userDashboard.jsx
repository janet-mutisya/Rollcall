import React, { useState, useEffect } from 'react';
import { 
  Clock, MapPin, Calendar, Bell, User, Settings, LogOut, CheckCircle, XCircle, 
  AlertCircle, TrendingUp, FileText, HeartHandshake, Upload, Send, Eye, Download
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [showSickSheetModal, setShowSickSheetModal] = useState(false);
  
  // Sick Sheet Form State
  const [sickSheetForm, setSickSheetForm] = useState({
    reason: '',
    attachmentUrl: null
  });
  const [fileUploading, setFileUploading] = useState(false);

  // Mock employee data
  const employee = {
    serviceNumber: 1001,
    name: 'John Doe',
    site: 'Nairobi HQ',
    department: 'Engineering',
    position: 'Software Developer',
    workType: 'Office'
  };

  // Mock current shift data
  const [currentShift, setCurrentShift] = useState({
    serviceNumber: 1001,
    site: 'Nairobi HQ',
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: 'Day',
    shiftTime: '06:00-18:00',
    status: 'Scheduled'
  });

  // Mock sick sheets history
  const [sickSheets, setSickSheets] = useState([
    {
      _id: '1',
      date: '2025-08-05',
      reason: 'Flu symptoms',
      attachmentUrl: '/docs/medical_cert_001.pdf',
      createdAt: '2025-08-05T08:00:00Z'
    },
    {
      _id: '2',
      date: '2025-07-20',
      reason: 'Food poisoning',
      attachmentUrl: null,
      createdAt: '2025-07-20T09:30:00Z'
    }
  ]);

  // Mock upcoming shifts
  const [upcomingShifts, setUpcomingShifts] = useState([
    {
      shiftDate: '2025-08-11',
      shiftType: 'Day',
      shiftTime: '06:00-18:00',
      site: 'Nairobi HQ'
    },
    {
      shiftDate: '2025-08-12',
      shiftType: 'Night',
      shiftTime: '18:00-06:00',
      site: 'Nairobi HQ'
    },
    {
      shiftDate: '2025-08-13',
      shiftType: 'Day',
      shiftTime: '06:00-18:00',
      site: 'Nairobi HQ'
    }
  ]);

  const [workHours] = useState({ today: '7h 32m', week: '38h 15m' });

  // Site location for GPS verification
  const siteLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi HQ coordinates

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate GPS location detection
  useEffect(() => {
    if (navigator.geolocation && employee.workType === 'Office') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          const distance = calculateDistance(
            userLat, userLng,
            siteLocation.lat, siteLocation.lng
          );
          
          setLocation({ lat: userLat, lng: userLng, distance });
          setLocationVerified(distance <= 0.1); // 100m radius
        },
        (error) => {
          setLocation({ error: 'Location access required for check-in' });
        }
      );
    } else if (employee.workType === 'Remote') {
      setLocationVerified(true);
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCheckIn = async () => {
    if (locationVerified || employee.workType === 'Remote') {
      setIsCheckedIn(true);
      setCheckInTime(currentTime);
      
      // Here you would typically make an API call to record attendance
      console.log('Check-in recorded:', {
        serviceNumber: employee.serviceNumber,
        checkInTime: currentTime,
        location: location,
        shift: currentShift._id
      });
    }
  };

  const handleCheckOut = async () => {
    setIsCheckedIn(false);
    const checkOutTime = currentTime;
    
    // Calculate work hours
    if (checkInTime) {
      const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      console.log('Check-out recorded:', {
        serviceNumber: employee.serviceNumber,
        checkOutTime: checkOutTime,
        hoursWorked: hoursWorked.toFixed(2)
      });
    }
    
    setCheckInTime(null);
  };

  const handleFileUpload = async (file) => {
    setFileUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const fileUrl = `/uploads/sick_sheet_${Date.now()}_${file.name}`;
      setSickSheetForm(prev => ({ ...prev, attachmentUrl: fileUrl }));
      setFileUploading(false);
    }, 2000);
  };

  const handleSickSheetSubmit = async (e) => {
    e.preventDefault();
    
    const newSickSheet = {
      user: employee._id, // Would come from auth context
      serviceNumber: employee.serviceNumber,
      date: new Date(),
      reason: sickSheetForm.reason,
      attachmentUrl: sickSheetForm.attachmentUrl
    };
    
    // Here you would make API call to POST /api/sick-sheets
    console.log('Submitting sick sheet:', newSickSheet);
    
    // Add to local state for demo
    setSickSheets(prev => [
      {
        _id: Date.now().toString(),
        date: new Date().toISOString(),
        reason: sickSheetForm.reason,
        attachmentUrl: sickSheetForm.attachmentUrl,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    
    // Reset form and close modal
    setSickSheetForm({ reason: '', attachmentUrl: null });
    setShowSickSheetModal(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <Button
      onClick={() => onClick(id)}
      variant="outline"
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Current Shift Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Shift</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentShift.shiftType === 'Day' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {currentShift.shiftType} Shift
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Time</p>
            <p className="font-medium text-gray-900">{currentShift.shiftTime}</p>
          </div>
          <div>
            <p className="text-gray-600">Site</p>
            <p className="font-medium text-gray-900">{currentShift.site}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium text-gray-900">{formatDate(currentShift.shiftDate)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className={`text-lg font-semibold ${isCheckedIn ? 'text-green-600' : 'text-gray-900'}`}>
                {isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </p>
              {checkInTime && (
                <p className="text-sm text-gray-500">Since {formatTime(checkInTime)}</p>
              )}
            </div>
            {isCheckedIn ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hours Today</p>
              <p className="text-lg font-semibold text-gray-900">{workHours.today}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-lg font-semibold text-gray-900">{workHours.week}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900">{employee.site}</p>
              <div className="flex items-center space-x-1 mt-1">
                {locationVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${locationVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {employee.workType === 'Remote' ? 'Remote Work' : locationVerified ? 'At Work Location' : 'Not at Work Location'}
                </span>
              </div>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Check-in Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time & Attendance</h3>
        
        {location && !location.error && employee.workType === 'Office' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Current Location Verification</p>
                <p className="text-xs text-gray-600 mt-1">
                  Distance from {employee.site}: {(location.distance * 1000).toFixed(0)}m
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                locationVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {locationVerified ? 'Verified' : 'Too Far'}
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn || (!locationVerified && employee.workType === 'Office')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              isCheckedIn 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : (!locationVerified && employee.workType === 'Office')
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Clock className="h-5 w-5 inline mr-2" />
            {isCheckedIn ? 'Already Checked In' : 'Check In'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              !isCheckedIn 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Clock className="h-5 w-5 inline mr-2" />
            Check Out
          </button>
        </div>

        {!locationVerified && employee.workType === 'Office' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                You must be within 100m of {employee.site} to check in.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action - Submit Sick Sheet */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Submit Sick Sheet</h3>
          <button
            onClick={() => setShowSickSheetModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Submit Sick Sheet</span>
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Report sick leave and upload medical certificates when needed.
        </p>
      </div>
    </div>
  );

  const renderShifts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Shifts</h3>
        <div className="space-y-3">
          {upcomingShifts.map((shift, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  shift.shiftType === 'Day' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{formatDate(shift.shiftDate)}</p>
                  <p className="text-sm text-gray-600">{shift.site}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{shift.shiftType}</p>
                <p className="text-sm text-gray-600">{shift.shiftTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSickSheets = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sick Sheet History</h3>
          <Button
            onClick={() => setShowSickSheetModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            New Sick Sheet
          </Button>
        </div>
        
        <div className="space-y-3">
          {sickSheets.map((sheet) => (
            <div key={sheet._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <HeartHandshake className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">{sheet.reason}</p>
                  <p className="text-sm text-gray-600">{formatDate(sheet.date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {sheet.attachmentUrl && (
                  <Button className="text-blue-600 hover:text-blue-800">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button className="text-gray-600 hover:text-gray-800">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Employee Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                <p className="text-xs text-gray-600">Service #{employee.serviceNumber}</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {employee.name}!</h2>
          <p className="text-gray-600">{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })} • {formatTime(currentTime)}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg border">
          <TabButton id="dashboard" label="Dashboard" icon={TrendingUp} isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
          <TabButton id="shifts" label="My Shifts" icon={Clock} isActive={activeTab === 'shifts'} onClick={setActiveTab} />
          <TabButton id="sick-sheets" label="Sick Sheets" icon={HeartHandshake} isActive={activeTab === 'sick-sheets'} onClick={setActiveTab} />
        </div>

        {/* Main Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'shifts' && renderShifts()}
        {activeTab === 'sick-sheets' && renderSickSheets()}
      </div>

      {/* Sick Sheet Modal */}
      {showSickSheetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Sick Sheet</h3>
            
            <form onSubmit={handleSickSheetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Absence *
                </label>
                <textarea
                  value={sickSheetForm.reason}
                  onChange={(e) => setSickSheetForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe your illness or medical condition..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Certificate (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload medical certificate or doctor's note</p>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="sick-sheet-upload"
                  />
                  <label
                    htmlFor="sick-sheet-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                  >
                    {fileUploading ? 'Uploading...' : 'Choose File'}
                  </label>
                  {sickSheetForm.attachmentUrl && (
                    <p className="text-sm text-green-600 mt-2">✓ File uploaded successfully</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSickSheetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!sickSheetForm.reason || fileUploading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;