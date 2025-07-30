import { useState } from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";

function Navbar() {
  const[message, setMessage] = useState('')
  const navigate = useNavigate;

  const handleLogout =() =>{
    localStorage.removeItem("token");
    setMessage('User logged out successfully');
    setTimeout(() =>{
     navigate('/login');
     }, 10000)}

  return (
    <nav className="p-4 shadow-md bg-white flex items-center justify-between">
      <ul className="flex hidden md:flex gap-6 text-gray-700 font-medium">
        <li className="hover:text-blue-600">
          <Link to="/">Dashboard</Link>
        </li>
        <li className="hover:text-blue-600">
          <Link to="/attendance">Attendance</Link>
        </li>
        <li className="hover:text-blue-600">
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
      <button variant="ghost" className=" text-red-500 hover:text-red-800" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
