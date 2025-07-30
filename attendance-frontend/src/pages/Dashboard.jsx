import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  CalendarDays,
  User,
  Calendar,
  Users,
  MessageCircle,
  ClipboardList,
  LogIn,
  LogOut,
} from "lucide-react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const cards = [
  { label: "PROFILE", icon: <User size={28} />, color: "bg-blue-500" },
  { label: "EVENTS", icon: <Calendar size={28} />, color: "bg-green-500" },
  { label: "STAFFS", icon: <Users size={28} />, color: "bg-orange-500" },
  { label: "ATTENDANCE", icon: <CheckCircle size={28} />, color: "bg-purple-500" },
  { label: "CHECK IN", icon: <LogIn size={28} />, color: "bg-cyan-600" },
  { label: "CHECK OUT", icon: <LogOut size={28} />, color: "bg-amber-600" },
  { label: "CHATBOX", icon: <MessageCircle size={28} />, color: "bg-pink-500" },
  { label: "GRADESHEET", icon: <ClipboardList size={28} />, color: "bg-red-500" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadData() {
      try {
        const res = await api.get("/attendance/my");
        console.log("Raw Attendance Data:", res.data);

        const attendanceArray = res.data.data || [];

        const grouped = attendanceArray.reduce((acc, item) => {
          const date = new Date(item.date).toLocaleDateString();
          acc[date] = acc[date] || { date, Present: 0, Absent: 0 };

          if (item.status === "Present") acc[date].Present++;
          if (item.status === "Absent") acc[date].Absent++;

          return acc;
        }, {});

        const chartData = Object.values(grouped);
        console.log("Grouped Chart Data:", chartData);
        setData(chartData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    }

    loadData();
  }, [navigate]);

  const handleCardClick = async (label) => {
    if (label === "PROFILE") navigate("/profile");
    if (label === "EVENTS") navigate("/events");
    if (label === "STAFFS") navigate("/staffs");
    if (label === "ATTENDANCE") navigate("/attendanceMenu");
    if (label === "CHECK IN") {
      try {
        await api.post("/attendance/check-in");
        alert("Checked In Successfully");
      } catch (err) {
        console.error("Check In Error", err);
        alert("Check In Failed");
      }
    }
    if (label === "CHECK OUT") {
      try {
        await api.post("/attendance/check-out");
        alert("Checked Out Successfully");
      } catch (err) {
        console.error("Check Out Error", err);
        alert("Check Out Failed");
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-600">
      <h1 className="font-bold mb-8 text-3xl text-center text-white">
        Attendance Dashboard
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.label)}
            className={`${card.color} rounded-xl p-6 text-white flex flex-col items-center justify-center h-36 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer`}
          >
            <span>{card.icon}</span>
            <span className="mt-4 text-sm font-semibold">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <CalendarDays className="text-blue-500" />
          Dashboard
        </h1>

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" />
            Attendance Summary
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Present" fill="#4ade80" />
              <Bar dataKey="Absent" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-white">
        &copy; 2025 Attendance System. All rights reserved.
      </footer>
    </div>
  );}