import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Hash,
  UserCheck,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const API_BASE = "http://localhost:5000/api/auth/signup";
const ALLOWED_ROLES = ["user", "manager", "admin"];

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    serviceNumber: "",
    phoneNumber: "",
    role: "user" // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validate role before sending
    if (!ALLOWED_ROLES.includes(formData.role)) {
      setErrors(["Invalid role selected"]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setRegisteredUser(data.user);
        setFormData({
          name: "",
          email: "",
          password: "",
          serviceNumber: "",
          phoneNumber: "",
          role: "user"
        });
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else if (data.message) {
          setErrors([data.message]);
        } else {
          setErrors(["Registration failed. Please try again."]);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors(["Network error. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Registration Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Your account is pending admin approval.
            </p>
            {registeredUser && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p><strong>Name:</strong> {registeredUser.name}</p>
                <p><strong>Email:</strong> {registeredUser.email}</p>
                <p><strong>Service Number:</strong> {registeredUser.serviceNumber}</p>
                <p><strong>Role:</strong> {registeredUser.role}</p>
                <p><strong>Status:</strong> {registeredUser.approvalStatus}</p>
              </div>
            )}
            <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Awaiting Admin Approval</AlertTitle>
              <AlertDescription>
                You will receive an email once approved.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => (window.location.href = "/login")}>
                Go to Login
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setRegisteredUser(null);
                }}
              >
                Register Another User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Service Number"
                name="serviceNumber"
                value={formData.serviceNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Phone Number (optional)"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-400" />
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <UserCheck className="mr-2 inline h-5 w-5" />
              New accounts get the <strong>User</strong> role by default.
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
