import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ClipboardCheck,
  Loader2,
  Users,
  FileText,
  AlertTriangle,
  Settings,
  UserPlus,
  CalendarDays,
  Activity,
  Wifi,
  WifiOff,
  MapPin,
  Sun,
  Moon,
  CheckCircle,
  UserCheck,
  Bell,
  X,
  Check,
  ChevronDown
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [processingApproval, setProcessingApproval] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 8750,
    dayShiftPresent: 0,
    dayShiftLate: 0,
    nightShiftPresent: 0,
    nightShiftLate: 0,
    dayShiftLoggedIn: 0,
    nightShiftLoggedIn: 0,
    pendingSickSheets: 47,
    upcomingHolidays: 2,
    emergencies: 3,
    pendingApprovals: 0,
    locations: {
      // Nairobi County
      "Nairobi HQ - CBD": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 750, totalNight: 750, county: "Nairobi" },
      "Nairobi Westlands": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 425, totalNight: 425, county: "Nairobi" },
      "Nairobi Kilimani": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 325, totalNight: 325, county: "Nairobi" },
      
      // Mombasa County
      "Mombasa Main Branch": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 600, totalNight: 600, county: "Mombasa" },
      "Mombasa Port Office": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 375, totalNight: 375, county: "Mombasa" },
      "Mombasa Nyali": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 200, totalNight: 200, county: "Mombasa" },
      
      // Kisumu County
      "Kisumu Central": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 400, totalNight: 400, county: "Kisumu" },
      "Kisumu Kondele": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 225, totalNight: 225, county: "Kisumu" },
      
      // Nakuru County
      "Nakuru Main": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 450, totalNight: 450, county: "Nakuru" },
      "Nakuru Industrial": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 275, totalNight: 275, county: "Nakuru" },
      
      // Eldoret (Uasin Gishu County)
      "Eldoret Branch": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 550, totalNight: 550, county: "Uasin Gishu" },
      
      // Remote Workers - Day shift only
      "Remote National": { dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0, totalDay: 595, totalNight: 0, county: "Remote" }
    }
  });
  
  const [recentLogins, setRecentLogins] = useState([]);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCounty, setSelectedCounty] = useState("All Counties");

  // Fetch pending user approvals
  const fetchPendingApprovals = async () => {
    try {
      const mockPendingUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@company.com",
          department: "IT",
          position: "Software Developer",
          submittedAt: "2025-01-15T10:30:00Z",
          reason: "New employee registration"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@company.com",
          department: "Marketing",
          position: "Marketing Specialist",
          submittedAt: "2025-01-15T09:15:00Z",
          reason: "Department transfer request"
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike.johnson@company.com",
          department: "Sales",
          position: "Sales Representative",
          submittedAt: "2025-01-15T08:45:00Z",
          reason: "Role change approval"
        }
      ];
      
      setPendingUsers(mockPendingUsers);
      setDashboardStats(prev => ({
        ...prev,
        pendingApprovals: mockPendingUsers.length
      }));
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    }
  };

  // Handle user approval/rejection
  const handleUserAction = async (userId, action) => {
    setProcessingApproval(userId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setDashboardStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
      console.log(`User ${userId} ${action}d successfully`);
      
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    } finally {
      setProcessingApproval(null);
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  // Determine current shift based on time
  const getCurrentShift = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  };

  // Check if login is late based on shift
  const isLateLogin = (loginTime, shift) => {
    const hour = loginTime.getHours();
    const minute = loginTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    if (shift === 'day') {
      return timeInMinutes > 405; // 6:45 AM
    } else {
      return timeInMinutes > 1125; // 6:45 PM
    }
  };

  // Get shift time range for display
  const getShiftTimeRange = (shift) => {
    return shift === 'day' ? '06:00 - 18:00' : '18:00 - 06:00';
  };

  // Get late cutoff time for display
  const getLateCutoff = (shift) => {
    return shift === 'day' ? '06:45' : '18:45';
  };

  // Get county summary with shift data
  const getCountySummary = () => {
    const summary = {};
    Object.entries(dashboardStats.locations).forEach(([location, data]) => {
      if (!summary[data.county]) {
        summary[data.county] = { 
          dayPresent: 0, dayLate: 0, nightPresent: 0, nightLate: 0,
          totalDay: 0, totalNight: 0, locations: 0 
        };
      }
      summary[data.county].dayPresent += data.dayPresent;
      summary[data.county].dayLate += data.dayLate;
      summary[data.county].nightPresent += data.nightPresent;
      summary[data.county].nightLate += data.nightLate;
      summary[data.county].totalDay += data.totalDay;
      summary[data.county].totalNight += data.totalNight;
      summary[data.county].locations += 1;
    });
    return summary;
  };

  // Function to handle actual user check-ins
  const handleUserCheckin = (checkinData) => {
    const { 
      employeeName, 
      employeeId, 
      location, 
      department, 
      checkinTime = new Date() 
    } = checkinData;

    const currentShift = getCurrentShift();
    const timeString = checkinTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = isLateLogin(checkinTime, currentShift);

    // Add to recent logins
    const newLogin = {
      name: employeeName,
      employeeId,
      time: timeString,
      status: isLate ? "late" : "present",
      location: location,
      department: department,
      shift: currentShift,
      timestamp: checkinTime
    };

    setRecentLogins(prev => [newLogin, ...prev.slice(0, 19)]);

    // Update dashboard stats
    setDashboardStats(prev => {
      const newLocations = { ...prev.locations };
      
      if (newLocations[location]) {
        if (currentShift === 'day') {
          if (isLate) {
            newLocations[location].dayLate += 1;
          } else {
            newLocations[location].dayPresent += 1;
          }
        } else {
          if (isLate) {
            newLocations[location].nightLate += 1;
          } else {
            newLocations[location].nightPresent += 1;
          }
        }
      }

      const dayShiftPresent = Object.values(newLocations).reduce((sum, loc) => sum + loc.dayPresent, 0);
      const dayShiftLate = Object.values(newLocations).reduce((sum, loc) => sum + loc.dayLate, 0);
      const nightShiftPresent = Object.values(newLocations).reduce((sum, loc) => sum + loc.nightPresent, 0);
      const nightShiftLate = Object.values(newLocations).reduce((sum, loc) => sum + loc.nightLate, 0);

      return {
        ...prev,
        dayShiftPresent,
        dayShiftLate,
        nightShiftPresent,
        nightShiftLate,
        dayShiftLoggedIn: dayShiftPresent + dayShiftLate,
        nightShiftLoggedIn: nightShiftPresent + nightShiftLate,
        locations: newLocations
      };
    });
  };

  // Load existing attendance data on component mount
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        console.log("Dashboard loaded - waiting for real check-ins");
        await fetchPendingApprovals();
      } catch (error) {
        console.error("Error loading attendance data:", error);
      }
    };

    loadAttendanceData();
  }, []);

  // Real network connection status detection
  useEffect(() => {
    function updateOnlineStatus() {
      setIsRealTimeConnected(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Enhanced navigation handler
  const handleNavigation = (path) => {
    try {
      const routeMap = {
        "/admin/sick-sheets": "/SickSheet",
        "/admin/holidays": "/Holiday",
        "/admin/public-holidays": "/PublicHolidays",
        "/admin/emergencies": "/Emergencies",
        "/admin/assign-roles": "/Roles",
        "/admin/shifts": "/Shifts",
        "/admin/attendance": "/UserAttendance",
        "/admin/reports": "/Report",
        "/admin/settings": "/settings",
        "/admin/offdays": "/Offdays"
      };

      const targetRoute = routeMap[path] || path;
      
      if (!navigate || typeof navigate !== 'function') {
        const errorMsg = "Navigate function is not available";
        console.error(errorMsg);
        alert(`Navigation Error: ${errorMsg}`);
        return;
      }
      
      navigate(targetRoute);
      
    } catch (error) {
      console.error("Navigation error:", error);
      alert(`Navigation failed: ${error.message}`);
    }
  };

  const handleNavigationFallback = (path) => {
    const routeMap = {
      "/admin/sick-sheets": "/SickSheet",
      "/admin/holidays": "/Holiday", 
      "/admin/public-holidays": "/PublicHolidays",
      "/admin/emergencies": "/Emergencies",
      "/admin/assign-roles": "/Roles",
      "/admin/shifts": "/Shifts",
      "/admin/attendance": "/UserAttendance",
      "/admin/reports": "/Report",
      "/admin/settings": "/settings",
      "/admin/offdays": "/Offdays"
    };

    const targetRoute = routeMap[path] || path;
    window.location.href = targetRoute;
  };

  // Admin cards configuration
  const adminCards = [
    {
      label: "VIEW SICK SHEETS",
      icon: <FileText size={28} />,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => handleNavigation("/admin/sick-sheets"),
      fallbackAction: () => handleNavigationFallback("/admin/sick-sheets"),
      badge: dashboardStats.pendingSickSheets > 0 ? dashboardStats.pendingSickSheets : null,
      description: "Review and approve employee sick leave requests"
    },
    {
      label: "MANAGE HOLIDAYS",
      icon: <CalendarDays size={28} />,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => handleNavigation("/admin/holidays"),
      fallbackAction: () => handleNavigationFallback("/admin/holidays"),
      badge: dashboardStats.upcomingHolidays > 0 ? dashboardStats.upcomingHolidays : null,
      description: "Update and manage company holidays and events"
    },
    {
      label: "PUBLIC HOLIDAYS",
      icon: <Calendar size={28} />,
      color: "bg-green-500 hover:bg-green-600",
      action: () => handleNavigation("/admin/public-holidays"),
      fallbackAction: () => handleNavigationFallback("/admin/public-holidays"),
      description: "View who attended during public holidays"
    },
    {
      label: "EMERGENCIES",
      icon: <AlertTriangle size={28} />,
      color: "bg-red-500 hover:bg-red-600",
      action: () => handleNavigation("/admin/emergencies"),
      fallbackAction: () => handleNavigationFallback("/admin/emergencies"),
      badge: dashboardStats.emergencies > 0 ? dashboardStats.emergencies : null,
      description: "Handle emergency situations and urgent notifications"
    },
    {
      label: "OFF DAYS",
      icon: <Calendar size={28} />,
      color: "bg-gray-500 hover:bg-gray-600",
      action: () => handleNavigation("/admin/offdays"),
      fallbackAction: () => handleNavigationFallback("/admin/offdays"),
      description: "See who are on off days"
    },
    {
      label: "ASSIGN ROLES",
      icon: <UserPlus size={28} />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => handleNavigation("/admin/assign-roles"),
      fallbackAction: () => handleNavigationFallback("/admin/assign-roles"),
      description: "Manage employee roles and permissions"
    },
    {
      label: "ASSIGN SHIFTS",
      icon: <Clock size={28} />,
      color: "bg-teal-500 hover:bg-teal-600",
      action: () => handleNavigation("/admin/shifts"),
      fallbackAction: () => handleNavigationFallback("/admin/shifts"),
      description: "Create and assign work shifts to employees"
    },
    {
      label: "ALL ATTENDANCE",
      icon: <ClipboardCheck size={28} />,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => handleNavigation("/admin/attendance"),
      fallbackAction: () => handleNavigationFallback("/admin/attendance"),
      description: "View comprehensive user attendance records"
    },
    {
      label: "EMPLOYEE REPORTS",
      icon: <Activity size={28} />,
      color: "bg-green-600 hover:bg-green-700",
      action: () => handleNavigation("/admin/reports"),
      fallbackAction: () => handleNavigationFallback("/admin/reports"),
      description: "Generate detailed employee performance reports"
    },
    {
      label: "SYSTEM SETTINGS",
      icon: <Settings size={28} />,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () => handleNavigation("/admin/settings"),
      fallbackAction: () => handleNavigationFallback("/admin/settings"),
      description: "Configure system preferences and policies"
    }
  ];

  const countySummary = getCountySummary();
  const uniqueCounties = [...new Set(Object.values(dashboardStats.locations).map(loc => loc.county))];
  const currentShift = getCurrentShift();

  // Calculate totals for current shift
  const currentShiftLoggedIn = currentShift === 'day' ? dashboardStats.dayShiftLoggedIn : dashboardStats.nightShiftLoggedIn;
  const currentShiftPresent = currentShift === 'day' ? dashboardStats.dayShiftPresent : dashboardStats.nightShiftPresent;
  const currentShiftLate = currentShift === 'day' ? dashboardStats.dayShiftLate : dashboardStats.nightShiftLate;
  const currentShiftCapacity = Object.values(dashboardStats.locations).reduce((sum, loc) => {
    return sum + (currentShift === 'day' ? loc.totalDay : loc.totalNight);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 text-center text-lg">Multi-County Operations Management System</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            >
              <Bell size={24} className="text-gray-600" />
              {dashboardStats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {dashboardStats.pendingApprovals}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Pending Approvals</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} awaiting approval
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {pendingUsers.length === 0 ? (
                    <div className="p-6 text-center">
                      <UserCheck className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">No pending approvals</p>
                    </div>
                  ) : (
                    pendingUsers.map((user) => (
                      <div key={user.id} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-800 truncate">{user.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {user.department}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{user.position}</p>
                            <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                            <p className="text-xs text-gray-500 mb-3">
                              Submitted: {new Date(user.submittedAt).toLocaleDateString()} at{' '}
                              {new Date(user.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                              "{user.reason}"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            disabled={processingApproval === user.id}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs rounded font-medium transition-colors"
                          >
                            {processingApproval === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'reject')}
                            disabled={processingApproval === user.id}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs rounded font-medium transition-colors"
                          >
                            {processingApproval === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {pendingUsers.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All Approvals
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Current Shift Indicator */}
        <div className="flex justify-center mt-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentShift === 'day' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {currentShift === 'day' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-semibold">
              {currentShift === 'day' ? 'Day Shift' : 'Night Shift'}
            </span>
            <span className="text-sm">({getShiftTimeRange(currentShift)})</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              Late after {getLateCutoff(currentShift)}
            </span>
          </div>
        </div>
      </div>

      {/* Integration Notice */}
      <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">📊 Real-Time Attendance Tracking</h3>
        <div className="text-sm text-blue-700">
          <p>This dashboard displays real attendance data. Counts will update automatically when employees check in through:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Mobile app check-ins</li>
            <li>Web portal logins</li>
            <li>Biometric scanners</li>
            <li>QR code scanning</li>
          </ul>
          <div className="flex items-center mt-3 space-x-2">
            {isRealTimeConnected ? (
              <>
                <Wifi size={16} className="text-green-600" />
                <span className="text-green-700 font-medium">Connected - Live Updates Active</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-600" />
                <span className="text-red-700 font-medium">Offline - Updates Paused</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Real-time attendance summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Employees</p>
              <p className="text-3xl font-bold">{dashboardStats.totalEmployees.toLocaleString()}</p>
            </div>
            <Users size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Current Shift Present</p>
              <p className="text-3xl font-bold">{currentShiftPresent.toLocaleString()}</p>
              <p className="text-green-200 text-xs">of {currentShiftCapacity.toLocaleString()}</p>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Current Shift Late</p>
              <p className="text-3xl font-bold">{currentShiftLate.toLocaleString()}</p>
              <p className="text-yellow-200 text-xs">after {getLateCutoff(currentShift)}</p>
            </div>
            <Clock size={32} className="text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold">
                {currentShiftCapacity > 0 ? Math.round((currentShiftLoggedIn / currentShiftCapacity) * 100) : 0}%
              </p>
              <p className="text-purple-200 text-xs">{currentShiftLoggedIn.toLocaleString()} logged in</p>
            </div>
            <Activity size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* County Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">County Overview - {currentShift === 'day' ? 'Day Shift' : 'Night Shift'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(countySummary).map(([county, data]) => {
            const present = currentShift === 'day' ? data.dayPresent : data.nightPresent;
            const late = currentShift === 'day' ? data.dayLate : data.nightLate;
            const total = currentShift === 'day' ? data.totalDay : data.totalNight;
            const loggedIn = present + late;
            const attendanceRate = total > 0 ? Math.round((loggedIn / total) * 100) : 0;

            return (
              <div key={county} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{county}</h3>
                  <MapPin size={16} className="text-gray-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Present:</span>
                    <span className="font-medium">{present}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Late:</span>
                    <span className="font-medium">{late}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span className="text-blue-600">Attendance:</span>
                    <span className="text-blue-600">{attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{data.locations} location{data.locations !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Administrative Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <div
              key={index}
              onClick={() => {
                try {
                  card.action();
                } catch (error) {
                  console.error("Primary navigation failed:", error);
                  card.fallbackAction();
                }
              }}
              className={`${card.color} p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-xl relative group`}
            >
              {card.badge && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {card.badge}
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 text-white group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-2 leading-tight">
                  {card.label}
                </h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Check-ins */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Check-ins</h3>
          {recentLogins.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No check-ins yet today</p>
              <p className="text-gray-400 text-sm">Check-ins will appear here as employees arrive</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentLogins.map((login, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      login.status === 'present' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">{login.name}</p>
                      <p className="text-sm text-gray-600">{login.department} • {login.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{login.time}</p>
                    <p className={`text-xs ${
                      login.status === 'present' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {login.status === 'present' ? 'On Time' : 'Late'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Details */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Location Details</h3>
            <select 
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="All Counties">All Counties</option>
              {uniqueCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(dashboardStats.locations)
              .filter(([_, data]) => selectedCounty === "All Counties" || data.county === selectedCounty)
              .map(([location, data]) => {
                const present = currentShift === 'day' ? data.dayPresent : data.nightPresent;
                const late = currentShift === 'day' ? data.dayLate : data.nightLate;
                const total = currentShift === 'day' ? data.totalDay : data.totalNight;
                const loggedIn = present + late;
                const attendanceRate = total > 0 ? Math.round((loggedIn / total) * 100) : 0;

                return (
                  <div key={location} className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{location}</p>
                        <p className="text-xs text-gray-500">{data.county} County</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{attendanceRate}%</p>
                        <p className="text-xs text-gray-600">{loggedIn}/{total}</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-xs">
                      <span className="text-green-600">Present: {present}</span>
                      <span className="text-yellow-600">Late: {late}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <p className="text-2xl font-bold text-green-600">{dashboardStats.dayShiftLoggedIn}</p>
          <p className="text-sm text-gray-600">Day Shift Total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <p className="text-2xl font-bold text-blue-600">{dashboardStats.nightShiftLoggedIn}</p>
          <p className="text-sm text-gray-600">Night Shift Total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <p className="text-2xl font-bold text-orange-600">{dashboardStats.pendingSickSheets}</p>
          <p className="text-sm text-gray-600">Pending Sick Sheets</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <p className="text-2xl font-bold text-red-600">{dashboardStats.emergencies}</p>
          <p className="text-sm text-gray-600">Active Emergencies</p>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            System Status: {isRealTimeConnected ? 'Online' : 'Offline'}
          </span>
          <span className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}