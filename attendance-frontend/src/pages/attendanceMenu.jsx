import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  BriefcaseMedical,
  AlertCircle,
  CheckCircle,
  FilePlus,
} from "lucide-react";

export default function AttendanceMenu() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // default to user

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const adminOptions = [
    { label: "Attendance Report", path: "/attendanceReport", icon: <ClipboardList /> },
    { label: "Sick Sheets", path: "/sickSheets", icon: <BriefcaseMedical /> },
    { label: "Emergencies", path: "/emergencies", icon: <AlertCircle /> },
    { label: "Dispatch", path: "/dispatch", icon: <ClipboardList /> },
  ];

  const userOptions = [
    { label: "My Attendance", path: "/attendance", icon: <CheckCircle /> },
    { label: "Submit Sick Sheet", path: "/submitSickSheet", icon: <FilePlus /> },
    { label: "Request Emergency", path: "/requestEmergency", icon: <AlertCircle /> },
  ];

  const options = role === "admin" ? adminOptions : userOptions;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {role === "admin" ? "Admin Attendance Panel" : "My Attendance"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => navigate(option.path)}
            className="bg-blue-500 text-white py-3 px-4 rounded-xl shadow hover:bg-blue-600 transition flex items-center gap-2 justify-center"
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

