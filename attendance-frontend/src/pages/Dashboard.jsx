
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
  Moon
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Determine current shift based on time
  const getCurrentShift = () => {
    const now = new Date();
    const hour = now.getHours();
    // Day shift: 06:00 - 18:00, Night shift: 18:00 - 06:00
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  };

  // Check if login is late based on shift
  const isLateLogin = (loginTime, shift) => {
    const hour = loginTime.getHours();
    const minute = loginTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    if (shift === 'day') {
      // Late after 6:45 AM (405 minutes from midnight)
      return timeInMinutes > 405; // 6:45 AM
    } else {
      // Night shift - late after 18:45 (1125 minutes from midnight)
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

  // Function to handle actual user check-ins (this would be called from your check-in system)
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
      
      // Update location-specific stats
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

      // Recalculate totals
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

    // Here you would also send the checkin data to your backend
    // Example: await sendCheckinToBackend(checkinData);
  };

  // Load existing attendance data on component mount
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        // In a real application, you would fetch this from your backend
        // const response = await fetch('/api/attendance/today');
        // const data = await response.json();
        // setDashboardStats(data);
        // setRecentLogins(data.recentLogins);
        
        // For now, starting with empty data - only real check-ins will populate it
        console.log("Dashboard loaded - waiting for real check-ins");
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

  // Listen for check-in events (this would come from your check-in system)
  useEffect(() => {
    // In a real application, you might listen for websocket events or poll an API
    // Example WebSocket listener:
    /*
    const ws = new WebSocket('ws://your-backend/attendance-updates');
    ws.onmessage = (event) => {
      const checkinData = JSON.parse(event.data);
      handleUserCheckin(checkinData);
    };
    
    return () => {
      ws.close();
    };
    */

    // For testing purposes, you can uncomment the demo function below
    // startDemoCheckins();
  }, []);

  // Demo function for testing (remove this in production)
  const startDemoCheckins = () => {
    const departments = ["IT", "Sales", "Marketing", "Finance", "Operations", "HR"];
    const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"];
    const locations = Object.keys(dashboardStats.locations);

    // Simulate a check-in every 10 seconds for demo purposes
    const interval = setInterval(() => {
      const demoCheckin = {
        employeeName: names[Math.floor(Math.random() * names.length)],
        employeeId: `EMP${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        checkinTime: new Date()
      };
      
      handleUserCheckin(demoCheckin);
    }, 10000);

    return () => clearInterval(interval);
  };

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
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-center text-lg">Multi-County Operations Management System</p>
        
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
            <li>Biometric scanner entries</li>
            <li>Manual admin entries</li>
          </ul>
          <p className="mt-2 text-blue-600">
            <strong>Current Status:</strong> All counters start at 0 and increment with actual check-ins only.
          </p>
        </div>
      </div>

      {/* Shift Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Day Shift */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800 flex items-center">
              <Sun className="mr-2 text-yellow-600" size={24} />
              Day Shift (06:00 - 18:00)
            </h3>
            <span className="text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-medium">
              Late after 06:45
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{dashboardStats.dayShiftPresent.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium">On Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{dashboardStats.dayShiftLate.toLocaleString()}</p>
              <p className="text-sm text-orange-600 font-medium">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{dashboardStats.dayShiftLoggedIn.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">Total Logged In</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {Object.values(dashboardStats.locations).reduce((sum, loc) => sum + loc.totalDay, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 font-medium">Capacity</p>
            </div>
          </div>
        </div>

        {/* Night Shift */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800 flex items-center">
              <Moon className="mr-2 text-blue-600" size={24} />
              Night Shift (18:00 - 06:00)
            </h3>
            <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
              Late after 18:45
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{dashboardStats.nightShiftPresent.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium">On Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{dashboardStats.nightShiftLate.toLocaleString()}</p>
              <p className="text-sm text-orange-600 font-medium">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{dashboardStats.nightShiftLoggedIn.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">Total Logged In</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {Object.values(dashboardStats.locations).reduce((sum, loc) => sum + loc.totalNight, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 font-medium">Capacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* County Overview */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <MapPin className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">County Overview:</h3>
            <select 
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Counties">All Counties</option>
              {uniqueCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Locations:</span> {Object.keys(dashboardStats.locations).length}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(countySummary).map(([county, data]) => (
            <div key={county} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 text-sm">{county}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-center items-center space-x-1">
                  <Sun size={12} className="text-yellow-600" />
                  <p className="text-blue-600 font-bold text-sm">
                    {(data.dayPresent + data.dayLate).toLocaleString()}/{data.totalDay.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-center items-center space-x-1">
                  <Moon size={12} className="text-blue-600" />
                  <p className="text-blue-600 font-bold text-sm">
                    {(data.nightPresent + data.nightLate).toLocaleString()}/{data.totalNight.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{data.locations} location{data.locations !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center bg-gray-100 p-4 rounded-lg space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isRealTimeConnected ? (
              <Wifi className="text-green-500" size={20} />
            ) : (
              <WifiOff className="text-red-500" size={20} />
            )}
            <span className={`text-sm font-medium ${isRealTimeConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isRealTimeConnected ? 'Real-time Connected' : 'Connection Lost'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">
            {currentShift === 'day' ? dashboardStats.dayShiftLoggedIn : dashboardStats.nightShiftLoggedIn}
          </span> / {currentShiftCapacity.toLocaleString()} employees checked in for {currentShift} shift
        </div>
      </div>

      {/* Current Shift Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow ${
          currentShift === 'day' ? 'bg-yellow-100' : 'bg-blue-100'
        }`}>
          <Users className={`mx-auto mb-3 ${currentShift === 'day' ? 'text-yellow-600' : 'text-blue-600'}`} size={32} />
          <p className={`text-3xl font-bold ${currentShift === 'day' ? 'text-yellow-800' : 'text-blue-800'}`}>
            {currentShiftCapacity.toLocaleString()}
          </p>
          <p className={`text-sm font-medium ${currentShift === 'day' ? 'text-yellow-600' : 'text-blue-600'}`}>
            {currentShift === 'day' ? 'Day Shift' : 'Night Shift'} Capacity
          </p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <ClipboardCheck className="mx-auto mb-3 text-green-600" size={32} />
          <p className="text-3xl font-bold text-green-800">{currentShiftLoggedIn.toLocaleString()}</p>
          <p className="text-sm text-green-600 font-medium">Checked In</p>
        </div>
        <div className="bg-emerald-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <Activity className="mx-auto mb-3 text-emerald-600" size={32} />
          <p className="text-3xl font-bold text-emerald-800">{currentShiftPresent.toLocaleString()}</p>
          <p className="text-sm text-emerald-600 font-medium">On Time</p>
        </div>
        <div className="bg-orange-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <AlertTriangle className="mx-auto mb-3 text-orange-600" size={32} />
          <p className="text-3xl font-bold text-orange-800">{currentShiftLate.toLocaleString()}</p>
          <p className="text-sm text-orange-600 font-medium">Late Arrivals</p>
        </div>
      </div>

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {adminCards.map((card, i) => (
          <div
            key={i}
            className="relative group cursor-pointer"
            onClick={() => {
              console.log(`Clicking on card: ${card.label}`);
              try {
                card.action();
              } catch (error) {
                console.error(`Primary navigation failed for ${card.label}:`, error);
                console.log(`Attempting fallback navigation for ${card.label}`);
                if (card.fallbackAction) {
                  card.fallbackAction();
                } else {
                  alert(`Navigation failed for ${card.label}. Please check console for details.`);
                }
              }
            }}
            onDoubleClick={() => {
              console.log(`Double-clicking (fallback) on card: ${card.label}`);
              if (card.fallbackAction) {
                card.fallbackAction();
              }
            }}
          >
            <div className={`p-6 rounded-xl text-white flex flex-col items-center justify-center space-y-4 transition-all duration-300 ${card.color} transform hover:scale-105 hover:shadow-xl`}>
              {card.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold animate-pulse">
                  {card.badge}
                </span>
              )}
              <div className="transform group-hover:scale-110 transition-transform duration-200">
                {card.icon}
              </div>
              <span className="font-bold text-center text-sm">{card.label}</span>
              <p className="text-xs text-center opacity-80 leading-tight">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Check-in Activity */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
            <Users className="mr-2 text-blue-600" size={20} />
            Recent Check-ins
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentLogins.length > 0 ? (
              recentLogins.slice(0, 10).map((login, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{login.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{login.time}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600 truncate">{login.location}</span>
                      <span>•</span>
                      <span>{login.department}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        {login.shift === 'day' ? <Sun size={12} className="mr-1" /> : <Moon size={12} className="mr-1" />}
                        {login.shift}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    login.status === 'present' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {login.status === 'present' ? 'On Time' : 'Late'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-sm">No check-ins yet today</p>
                <p className="text-gray-400 text-xs mt-1">Real attendance data will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="font-bold text-xl mb-6 flex items-center text-gray-800">
            <Activity className="mr-3 text-blue-600" size={24} />
            Today's Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <ClipboardCheck className="mr-2 text-blue-600" size={18} />
                Current Shift Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 font-medium flex items-center">
                    {currentShift === 'day' ? <Sun size={14} className="mr-1" /> : <Moon size={14} className="mr-1" />}
                    {currentShift === 'day' ? 'Day Shift' : 'Night Shift'}:
                  </span>
                  <span className="font-bold text-blue-800">{currentShiftLoggedIn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700 font-medium">On Time:</span>
                  <span className="font-bold text-emerald-800">{currentShiftPresent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 font-medium">Late:</span>
                  <span className="font-bold text-orange-800">{currentShiftLate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Capacity:</span>
                  <span className="font-bold text-gray-800">{currentShiftCapacity.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="mr-2 text-orange-600" size={18} />
                Admin Tasks
              </h3>
              <div className="space-y-2 text-sm">
                <Link to="/SickSheet" className="block">
                  <p className="flex justify-between hover:bg-orange-200 p-1 rounded transition-colors">
                    <span className="text-orange-700">Sick sheets:</span>
                    <span className="font-bold text-orange-800">{dashboardStats.pendingSickSheets}</span>
                  </p>
                </Link>
                <p className="flex justify-between">
                  <span className="text-purple-700">Holidays:</span>
                  <span className="font-bold text-purple-800">{dashboardStats.upcomingHolidays}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-red-700">Emergencies:</span>
                  <span className="font-bold text-red-800">{dashboardStats.emergencies}</span>
                </p>
                <div className="mt-3 pt-2 border-t border-orange-200">
                  <p className="flex justify-between">
                    <span className="text-blue-700">Attendance Rate:</span>
                    <span className="font-bold text-blue-800">
                      {currentShiftCapacity > 0 
                        ? Math.round((currentShiftLoggedIn / currentShiftCapacity) * 100)
                        : 0}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🔗 Integration Points</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>handleUserCheckin():</strong> Call this function when users check in</p>
              <p><strong>WebSocket:</strong> Listen for real-time check-in events</p>
              <p><strong>API:</strong> Load existing attendance data on component mount</p>
              <p><strong>Database:</strong> Sync with your attendance management system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section (Remove in Production) */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">🧪 Demo Mode</h3>
        <p className="text-sm text-yellow-700 mb-3">
          To test the check-in functionality, uncomment the <code>startDemoCheckins()</code> function call in the useEffect.
          This will simulate check-ins every 10 seconds for testing purposes.
        </p>
        <button 
          onClick={() => {
            // Demo check-in for testing
            handleUserCheckin({
              employeeName: "Test User",
              employeeId: "TEST001", 
              location: "Nairobi HQ - CBD",
              department: "IT",
              checkinTime: new Date()
            });
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Simulate Check-in
        </button>
      </div>
    </div>
  );}