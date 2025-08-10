import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
//import {Card} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [servicenumber, setServicenumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const userData = {
      name: username,
      email,
      password,
      phoneNumber: phonenumber,
      serviceNumber: servicenumber,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        userData
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token, user, and role
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        navigate("/dashboard");
      } else {
        setMessage("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);
      setMessage("Signup failed. Please try again.");
    }
  };

  return (
      <div className="bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 min-h-screen transition">
    <div className="flex flex-col gap-2 w-75 max-w-md mx-auto rounded-lg min-h-screen justify-center items-center">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4 w-full">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-75 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-75 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-75 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <Input
          type="text"
          placeholder="Phone Number"
          value={phonenumber}
          onChange={(e) => setPhonenumber(e.target.value)}
          className="w-75 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="text"
          placeholder="Service Number"
          value={servicenumber}
          onChange={(e) => setServicenumber(e.target.value)}
          className="w-75 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          variant="outline"
          className="w-75 text-white py-2 rounded bg-green-700"
        >
          Sign Up
        </Button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-red-500">{message}</p>
      )}
      </div>
    </div>
  );
}
