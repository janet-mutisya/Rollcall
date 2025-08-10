
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // call as a function

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMessage("User logged out successfully");
    setTimeout(() => {
      navigate("/login");
    }, 1000); 
  };

  return (
    <nav className="p-4 shadow-md bg-white flex items-center justify-between">
      {/* Logo or Brand Name */}
      <div className="text-xl font-bold text-blue-600">Attendance-System</div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
        <li className="hover:text-blue-600">
          <Link to="/">Dashboard</Link>
        </li>
        <li className="hover:text-blue-600">
          <Link to="/Shift">Shift</Link>
        </li>
        <li className="hover:text-blue-600">
          <Link to="/reports">Reports</Link>
        </li>
      </ul>

      {/* Hamburger Button for Mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden flex flex-col gap-1.5 focus:outline-none"
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-300 ${
            isMenuOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`block h-0.5 w-6 bg-gray-700 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-0" : "opacity-100"
          }`}
        ></span>
        <span
          className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-300 ${
            isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col gap-4 p-4 md:hidden text-gray-700 font-medium z-50">
          <li className="hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className="hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
            <Link to="/Shift">Shift</Link>
          </li>
          <li className="hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <button
              className="text-red-500 hover:text-red-800 w-full text-left"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}


