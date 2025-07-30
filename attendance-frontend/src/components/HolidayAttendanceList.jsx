import React, { useEffect, useState } from "react";
import axios from "axios";
import HolidayAttendanceCard from "./HolidayAttendanceCard";

const HolidayAttendanceList = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get("/api/holidayAttendance/me");
      setRecords(data.data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {records.map(record => (
        <HolidayAttendanceCard key={record._id} record={record} />
      ))}
    </div>
  );
};

export default HolidayAttendanceList;