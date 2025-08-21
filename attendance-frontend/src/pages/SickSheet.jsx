import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  User,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const SickSheet = () => {
  const navigate = (path) => console.log("Navigate to:", path);

  const toast = {
    success: (msg) => console.log("✅", msg),
    error: (msg) => console.error("❌", msg),
  };

  const [sickSheets, setSickSheets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
        setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button onClick={() => toast.success("Refreshed")}> 
          <Loader2 className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Total</AlertTitle>
          <AlertDescription>{stats.total}</AlertDescription>
        </Alert>
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Pending</AlertTitle>
          <AlertDescription>{stats.pending}</AlertDescription>
        </Alert>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Approved</AlertTitle>
          <AlertDescription>{stats.approved}</AlertDescription>
        </Alert>
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertTitle>Rejected</AlertTitle>
          <AlertDescription>{stats.rejected}</AlertDescription>
        </Alert>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/2"
        />

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm">Employee</th>
              <th className="px-6 py-3 text-left text-sm">Reason</th>
              <th className="px-6 py-3 text-left text-sm">Submitted</th>
              <th className="px-6 py-3 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sickSheets.map((sheet) => (
              <tr key={sheet._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{sheet.user.name}</td>
                <td className="px-6 py-4">{sheet.reason}</td>
                <td className="px-6 py-4">{formatDate(sheet.createdAt)}</td>
                <td className="px-6 py-4 space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Example */}
      {showModal && selectedSheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
            <h2 className="text-xl font-bold">Sick Sheet Details</h2>

            <p><strong>Employee:</strong> {selectedSheet.user.name}</p>
            <p><strong>Reason:</strong> {selectedSheet.reason}</p>

            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Admin notes..."
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
              <Button>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SickSheet;
