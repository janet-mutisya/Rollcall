import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Mock navigation for demo - replace with actual router
  const navigate = (path) => {
    console.log("Navigating to:", path);
    window.location.href = path;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("=== LOGIN RESPONSE DEBUG ===");
      console.log("Full response data:", data);
      console.log("Success:", data.success);
      console.log("User object:", data.user);
      console.log("User role:", data.user?.role);
      console.log("User roleLevel:", data.user?.roleLevel);

      if (data.success) {
        const token = data.token;
        const user = data.user;
        const role = user?.role?.toLowerCase(); // 🔧 Ensure role is lowercase
        const roleLevel = user?.roleLevel;

        console.log("=== STORING AUTH DATA ===");
        console.log("Token to store:", token ? "present" : "missing");
        console.log("Role to store:", role);
        console.log("RoleLevel to store:", roleLevel);
        console.log("Remember me:", rememberMe);

        // 🔧 Clear any existing auth data first (more thorough cleanup)
        const storageTypes = [localStorage, sessionStorage];
        const authKeys = ['token', 'role', 'roleLevel', 'user'];
        
        storageTypes.forEach(storage => {
          authKeys.forEach(key => {
            storage.removeItem(key);
          });
        });

        // 🔧 Store auth data consistently
        const storage = rememberMe ? localStorage : sessionStorage;
        
        if (token) {
          storage.setItem("token", token);
        }
        
        if (role) {
          storage.setItem("role", role); // Already lowercase from backend fix
        }
        
        if (roleLevel !== undefined) {
          storage.setItem("roleLevel", String(roleLevel));
        }

        // Store user data for easy access
        storage.setItem("user", JSON.stringify(user));

        // 🔧 Verify storage immediately after setting
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        const storedRole = localStorage.getItem("role") || sessionStorage.getItem("role");
        const storedRoleLevel = localStorage.getItem("roleLevel") || sessionStorage.getItem("roleLevel");
        
        console.log("=== VERIFICATION AFTER STORAGE ===");
        console.log("Stored token:", storedToken ? "present" : "missing");
        console.log("Stored role:", storedRole);
        console.log("Stored roleLevel:", storedRoleLevel);

        // 🔧 Enhanced navigation logic
        if (user?.approvalStatus === "pending") {
          navigate("/pending-approval");
        } else if (role === "admin" || (roleLevel !== undefined && roleLevel <= 10)) {
          navigate("/dashboard"); // Let App.jsx handle admin routes
        } else if (roleLevel !== undefined && roleLevel <= 50) {
          navigate("/dashboard"); // Supervisor dashboard
        } else {
          navigate("/dashboard");
        }

        // 🔧 Force re-read of auth state in App component
        // Dispatch a custom event to notify App.jsx of auth change
        window.dispatchEvent(new Event('storage'));
        
        // Small delay to ensure storage is written before reload
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
      } else {
        console.log("Login failed:", data.message);
        if (response.status === 423) {
          setError("Account locked due to too many failed login attempts. Try again later.");
        } else if (response.status === 429) {
          setError("Too many login attempts. Please try again later.");
        } else if (response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(data.message || "Login failed");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md shadow-lg border border-gray-100 bg-white rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center text-sm text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Remember me + forgot password */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </Label>
            <a
              href="/forgot-password"
              className="text-sm text-emerald-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-emerald-600 hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;