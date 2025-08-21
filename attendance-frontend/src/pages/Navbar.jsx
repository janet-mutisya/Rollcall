import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { toast } from "react-hot-toast";


export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("User logged out successfully");
    setTimeout(() => navigate("/login"), 800);
  };

  return (
    <nav className="p-4 shadow-md bg-white flex items-center justify-between">
      {/* Brand */}
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Attendance-System
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          Dashboard
        </Button>
        <Button variant="ghost" onClick={() => navigate("/shift")}>
          Shift
        </Button>
        <Button variant="ghost" onClick={() => navigate("/reports")}>
          Reports
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/sick-sheets")}
        >
          Sick Sheets
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-4 p-4">
            <Button variant="ghost" onClick={() => {navigate("/"); setIsMenuOpen(false);}}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => {navigate("/shift"); setIsMenuOpen(false);}}>
              Shift
            </Button>
            <Button variant="ghost" onClick={() => {navigate("/reports"); setIsMenuOpen(false);}}>
              Reports
            </Button>
            <Button variant="outline" onClick={() => {navigate("/admin/sick-sheets"); setIsMenuOpen(false);}}>
              Sick Sheets
            </Button>
            <Button variant="destructive" onClick={() => {setIsMenuOpen(false); handleLogout();}}>
              Logout
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
} 