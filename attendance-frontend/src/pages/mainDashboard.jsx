import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  if (!role) {
    return <p>Loading...</p>; // or redirect to login
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
