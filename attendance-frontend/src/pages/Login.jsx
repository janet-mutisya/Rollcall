import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data;

        try {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role);

          console.log("Token saved:", token);
          console.log("User saved:", user);
          console.log("Token in localStorage:", localStorage.getItem("token"));
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
          toast.error("Storage error. Try a different browser.");
          return;
        }

        toast.success("Login successful!");

        // Navigate based on user role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res.data.message || "Invalid credentials.");
        setError(res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Something went wrong.";
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-white-300 to-gray-500">
      <Toaster position="top-right" />
      <div className="flex items-center justify-center min-h-screen border border-lg">
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded shadow-md w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-75 border px-3 py-2 rounded focus:outline-none focus:ring"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-75 border px-3 py-2 rounded focus:outline-none focus:ring"
            />
          </div>

          <Button
            type="submit"
            variant="default"
            className="w-75 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Login
          </Button>

          <p className="mt-4 text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
