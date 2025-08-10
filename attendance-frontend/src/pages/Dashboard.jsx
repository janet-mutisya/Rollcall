import React, { useEffect, useState } from "react";
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
  WifiOff
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 25,
    presentToday: 0,
    loggedInToday: 0,
    pendingSickSheets: 3,
    upcomingHolidays: 2,
    emergencies: 1,
    locations: {
      "Nairobi HQ": { present: 0, total: 12 },
      "Mombasa Branch": { present: 0, total: 8 },
      "Kisumu Office": { present: 0, total: 3 },
      "Remote": { present: 0, total: 2 }
    }
  });
  
  const [recentLogins, setRecentLogins] = useState([]);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // Simulate real-time employee login tracking
  useEffect(() => {
    const initialLogins = [
      { name: "John Doe", time: "08:15 AM", status: "present", location: "Nairobi HQ", department: "IT" },
      { name: "Sarah Smith", time: "08:22 AM", status: "present", location: "Mombasa Branch", department: "Sales" },
      { name: "Mike Johnson", time: "08:45 AM", status: "late", location: "Remote", department: "Marketing" }
    ];
    
    setRecentLogins(initialLogins);
    
    const updatedLocations = { ...dashboardStats.locations };
    initialLogins.forEach(login => {
      if (updatedLocations[login.location]) {
        updatedLocations[login.location].present += 1;
      }
    });
    
    setDashboardStats(prev => ({
      ...prev,
      loggedInToday: initialLogins.length,
      presentToday: initialLogins.filter(emp => emp.status === "present").length,
      locations: updatedLocations
    }));

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && recentLogins.length < 25) {
        const employeeData = [
          { name: "Alice Brown", location: "Nairobi HQ", department: "Finance" },
          { name: "David Wilson", location: "Mombasa Branch", department: "Operations" },
          { name: "Emma Davis", location: "Kisumu Office", department: "HR" },
          { name: "James Miller", location: "Remote", department: "Design" },
          { name: "Lisa Garcia", location: "Nairobi HQ", department: "Legal" },
          { name: "Robert Taylor", location: "Mombasa Branch", department: "Sales" },
          { name: "Jennifer Moore", location: "Remote", department: "Content" },
          { name: "Michael Anderson", location: "Nairobi HQ", department: "Support" },
          { name: "Ashley Thomas", location: "Kisumu Office", department: "Admin" },
          { name: "Christopher Jackson", location: "Nairobi HQ", department: "Security" },
          { name: "Amanda White", location: "Mombasa Branch", department: "Training" },
          { name: "Daniel Harris", location: "Remote", department: "Research" },
          { name: "Michelle Martin", location: "Nairobi HQ", department: "Quality" },
          { name: "Kevin Thompson", location: "Kisumu Office", department: "Logistics" },
          { name: "Lauren Clark", location: "Nairobi HQ", department: "Product" },
          { name: "Ryan Rodriguez", location: "Mombasa Branch", department: "Customer Success" },
          { name: "Nicole Lewis", location: "Remote", department: "Analytics" },
          { name: "Brandon Lee", location: "Nairobi HQ", department: "Engineering" },
          { name: "Stephanie Walker", location: "Mombasa Branch", department: "Partnership" }
        ];
        
        const availableEmployees = employeeData.filter(emp => 
          !recentLogins.some(login => login.name === emp.name)
        );
        
        if (availableEmployees.length > 0) {
          const randomEmployee = availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
          const currentTime = new Date();
          const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isLate = currentTime.getHours() >= 9;
          
          const newLogin = {
            name: randomEmployee.name,
            time: timeString,
            status: isLate ? "late" : "present",
            location: randomEmployee.location,
            department: randomEmployee.department
          };
          
          setRecentLogins(prev => [newLogin, ...prev.slice(0, 9)]);
          
          setDashboardStats(prev => {
            const updatedLocations = { ...prev.locations };
            if (updatedLocations[randomEmployee.location]) {
              updatedLocations[randomEmployee.location].present += 1;
            }
            
            return {
              ...prev,
              loggedInToday: prev.loggedInToday + 1,
              presentToday: prev.presentToday + (isLate ? 0 : 1),
              locations: updatedLocations
            };
          });
        }
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [recentLogins.length]);

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

  const handleNavigation = (path) => {
    alert(`Navigation to ${path} - Replace with actual navigation logic`);
  };

  const adminCards = [
    {
      label: "VIEW SICK SHEETS",
      icon: <FileText size={28} />,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => handleNavigation("/admin/sick-sheets"),
      badge: dashboardStats.pendingSickSheets > 0 ? dashboardStats.pendingSickSheets : null,
      description: "Review and approve employee sick leave requests"
    },
    {
      label: "MANAGE HOLIDAYS",
      icon: <CalendarDays size={28} />,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => handleNavigation("/admin/holidays"),
      badge: dashboardStats.upcomingHolidays > 0 ? dashboardStats.upcomingHolidays : null,
      description: "Update and manage public holidays and company events"
    },
    {
      label: "EMERGENCIES",
      icon: <AlertTriangle size={28} />,
      color: "bg-red-500 hover:bg-red-600",
      action: () => handleNavigation("/admin/emergencies"),
      badge: dashboardStats.emergencies > 0 ? dashboardStats.emergencies : null,
      description: "Handle emergency situations and urgent notifications"
    },
    {
      label: "ASSIGN ROLES",
      icon: <UserPlus size={28} />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => handleNavigation("/admin/assign-roles"),
      description: "Manage employee roles and permissions"
    },
    {
      label: "MANAGE SHIFTS",
      icon: <Clock size={28} />,
      color: "bg-teal-500 hover:bg-teal-600",
      action: () => handleNavigation("/admin/shifts"),
      description: "Create and assign work shifts to employees"
    },
    {
      label: "ALL ATTENDANCE",
      icon: <ClipboardCheck size={28} />,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => handleNavigation("/admin/attendance"),
      description: "View comprehensive attendance records"
    },
    {
      label: "EMPLOYEE REPORTS",
      icon: <Activity size={28} />,
      color: "bg-green-500 hover:bg-green-600",
      action: () => handleNavigation("/admin/reports"),
      description: "Generate detailed employee performance reports"
    },
    {
      label: "SYSTEM SETTINGS",
      icon: <Settings size={28} />,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () => handleNavigation("/admin/settings"),
      description: "Configure system preferences and policies"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-center text-lg">Manage your organization's attendance system</p>
      </div>

      {/* Location Filter */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-800">Location Overview:</h3>
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Locations">All Locations</option>
            {Object.keys(dashboardStats.locations).map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {Object.entries(dashboardStats.locations).map(([location, data]) => (
            <div key={location} className="text-center">
              <p className="font-medium text-gray-700">{location}</p>
              <p className="text-blue-600">{data.present}/{data.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
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
          {dashboardStats.loggedInToday} / {dashboardStats.totalEmployees} employees logged in today
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <Users className="mx-auto mb-3 text-blue-600" size={32} />
          <p className="text-3xl font-bold text-blue-800">{dashboardStats.totalEmployees}</p>
          <p className="text-sm text-blue-600 font-medium">Total Employees</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow relative">
          <ClipboardCheck className="mx-auto mb-3 text-green-600" size={32} />
          <p className="text-3xl font-bold text-green-800">{dashboardStats.loggedInToday}</p>
          <p className="text-sm text-green-600 font-medium">Logged In Today</p>
          {dashboardStats.loggedInToday !== dashboardStats.presentToday && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
        </div>
        <div className="bg-emerald-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <Activity className="mx-auto mb-3 text-emerald-600" size={32} />
          <p className="text-3xl font-bold text-emerald-800">{dashboardStats.presentToday}</p>
          <p className="text-sm text-emerald-600 font-medium">On Time Today</p>
        </div>
        <div className="bg-red-100 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
          <AlertTriangle className="mx-auto mb-3 text-red-600" size={32} />
          <p className="text-3xl font-bold text-red-800">{dashboardStats.loggedInToday - dashboardStats.presentToday}</p>
          <p className="text-sm text-red-600 font-medium">Late Arrivals</p>
        </div>
      </div>

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {adminCards.map((card, i) => (
          <div
            key={i}
            className="relative group cursor-pointer"
            onClick={card.action}
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
        {/* Real-time Login Activity */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
            <Users className="mr-2 text-blue-600" size={20} />
            Recent Logins
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentLogins.length > 0 ? (
              recentLogins.map((login, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{login.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{login.time}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600">{login.location}</span>
                      <span>•</span>
                      <span>{login.department}</span>
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
              <p className="text-gray-500 text-sm text-center py-4">No recent logins</p>
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
                Attendance Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-medium">Logged In:</span>
                  <span className="font-bold text-green-800">{dashboardStats.loggedInToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700 font-medium">On Time:</span>
                  <span className="font-bold text-emerald-800">{dashboardStats.presentToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 font-medium">Late:</span>
                  <span className="font-bold text-orange-800">{dashboardStats.loggedInToday - dashboardStats.presentToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700 font-medium">Absent:</span>
                  <span className="font-bold text-red-800">{dashboardStats.totalEmployees - dashboardStats.loggedInToday}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="mr-2 text-orange-600" size={18} />
                Admin Tasks
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-orange-700">Sick sheets:</span>
                  <span className="font-bold text-orange-800">{dashboardStats.pendingSickSheets}</span>
                </p>
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
                      {dashboardStats.totalEmployees > 0 
                        ? Math.round((dashboardStats.loggedInToday / dashboardStats.totalEmployees) * 100)
                        : 0}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


       
