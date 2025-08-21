const Payslip = require("../models/payslip");
const Notification = require("../models/Notification");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// ======================= STAFF =======================

// Staff: view ALL their payslips (with filters)
exports.getMyPayslips = async (req, res) => {
  try {
    const { month, status, startDate, endDate } = req.query;

    const query = { staff: req.user.id };
    if (month) query.month = month;              // e.g. "2025-08"
    if (status) query.status = status;           // "Released" | "Pending"
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payslips = await Payslip.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payslips.length, data: payslips });
  } catch (err) {
    console.error("Error fetching payslips:", err);
    res.status(500).json({ success: false, message: "Error fetching payslips" });
  }
};

// Staff: view payslip notifications
exports.getMyPayslipNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      type: "payslip",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error("Error fetching payslip notifications:", err);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Staff: download ALL their payslips (PDF / Excel / CSV)
exports.downloadMyPayslips = async (req, res) => {
  try {
    const { format = "excel" } = req.query;

    const payslips = await Payslip.find({ staff: req.user.id }).sort({ createdAt: -1 });
    if (!payslips.length) {
      return res.status(404).json({ success: false, message: "No payslips found" });
    }

    // ===== CSV =====
    if (format === "csv") {
      const fields = ["month", "salary", "allowances", "deductions", "netPay", "status"];
      const parser = new Parser({ fields });
      const csv = parser.parse(payslips);

      res.header("Content-Type", "text/csv");
      res.attachment("my-payslips.csv");
      return res.send(csv);
    }

    // ===== EXCEL =====
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Payslips");

      worksheet.columns = [
        { header: "Month", key: "month", width: 15 },
        { header: "Salary", key: "salary", width: 15 },
        { header: "Allowances", key: "allowances", width: 15 },
        { header: "Deductions", key: "deductions", width: 15 },
        { header: "Net Pay", key: "netPay", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      payslips.forEach((p) => {
        worksheet.addRow({
          month: p.month,
          salary: p.salary,
          allowances: p.allowances,
          deductions: p.deductions,
          netPay: p.netPay,
          status: p.status,
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=my-payslips.xlsx");

      await workbook.xlsx.write(res);
      return res.end();
    }

    // ===== PDF =====
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=my-payslips.pdf");

      doc.fontSize(20).text("My Payslips", { align: "center" });
      doc.moveDown();

      payslips.forEach((p, index) => {
        doc.fontSize(14).text(`Payslip #${index + 1}`, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Month:      ${p.month}`);
        doc.text(`Salary:     ${p.salary}`);
        doc.text(`Allowances: ${p.allowances}`);
        doc.text(`Deductions: ${p.deductions}`);
        doc.text(`Net Pay:    ${p.netPay}`);
        doc.text(`Status:     ${p.status}`);
        doc.moveDown();
        doc.moveDown();
      });

      doc.pipe(res);
      doc.end();
      return;
    }

    // Unsupported format
    return res.status(400).json({ success: false, message: "Invalid format. Use pdf, excel, or csv." });
  } catch (err) {
    console.error("Error downloading payslips:", err);
    res.status(500).json({ success: false, message: "Error downloading payslips" });
  }
};

// ======================= ADMIN =======================

// Admin: view all payslips (with filters/pagination)
exports.getAllPayslips = async (req, res) => {
  try {
    const { staff, month, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (staff) query.staff = staff;
    if (month) query.month = month;
    if (status) query.status = status;

    const payslips = await Payslip.find(query)
      .populate("staff", "name email")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Payslip.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: payslips,
    });
  } catch (err) {
    console.error("Error fetching all payslips:", err);
    res.status(500).json({ success: false, message: "Error fetching payslips" });
  }
};

// Admin: create/release payslip
exports.createPayslip = async (req, res) => {
  try {
    const { staff, month, salary, allowances, deductions, netPay } = req.body;

    let fileUrl;
    if (req.file) {
      // If admin uploads a payslip file (PDF), save path (or swap with S3 logic)
      fileUrl = `/uploads/payslips/${Date.now()}-${req.file.originalname}`;
    }

    const payslip = await Payslip.create({
      staff,
      month,
      salary,
      allowances,
      deductions,
      netPay,
      fileUrl,
      releasedBy: req.user.id,
      status: "Released",
    });

    // Notify staff
    await Notification.create({
      user: staff,
      type: "payslip",
      title: "New Payslip Available",
      message: `Your payslip for ${month} is now available.`,
      link: `/payslips/${payslip._id}`,
    });

    res.status(201).json({ success: true, data: payslip });
  } catch (err) {
    console.error("Error creating payslip:", err);
    res.status(500).json({ success: false, message: "Server error creating payslip" });
  }
};

// Admin: export payslips as CSV
exports.exportPayslipsCSV = async (req, res) => {
  try {
    const { staffId, month } = req.query;

    const filter = {};
    if (staffId) filter.staff = staffId;
    if (month) filter.month = month;

    const payslips = await Payslip.find(filter).populate("staff", "name email");

    if (!payslips.length) {
      return res.status(404).json({ success: false, message: "No payslips found" });
    }

    const fields = [
      "staff.name",
      "staff.email",
      "month",
      "salary",
      "allowances",
      "deductions",
      "netPay",
      "status",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(payslips);

    res.header("Content-Type", "text/csv");
    res.attachment("payslips.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting payslips CSV:", err);
    res.status(500).json({ success: false, message: "Error exporting CSV" });
  }
};

// Admin: export payslips as Excel
exports.exportPayslipsExcel = async (req, res) => {
  try {
    const { staffId, month } = req.query;

    const filter = {};
    if (staffId) filter.staff = staffId;
    if (month) filter.month = month;

    const payslips = await Payslip.find(filter).populate("staff", "name email");

    if (!payslips.length) {
      return res.status(404).json({ success: false, message: "No payslips found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payslips");

    worksheet.columns = [
      { header: "Staff Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Month", key: "month", width: 15 },
      { header: "Salary", key: "salary", width: 15 },
      { header: "Allowances", key: "allowances", width: 15 },
      { header: "Deductions", key: "deductions", width: 15 },
      { header: "Net Pay", key: "netPay", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    payslips.forEach((p) => {
      worksheet.addRow({
        name: p.staff?.name,
        email: p.staff?.email,
        month: p.month,
        salary: p.salary,
        allowances: p.allowances,
        deductions: p.deductions,
        netPay: p.netPay,
        status: p.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=payslips.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting payslips Excel:", err);
    res.status(500).json({ success: false, message: "Error exporting Excel" });
  }
};

// Admin: get payslip stats (for dashboard) — formatted to your requested shape
exports.getPayslipStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPayslips = await Payslip.countDocuments();
    const releasedThisMonth = await Payslip.countDocuments({ createdAt: { $gte: startOfMonth } });
    const pendingPayslips = await Payslip.countDocuments({ status: "Pending" });

    // Grouped by staff with name/email in the result
    const grouped = await Payslip.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "staff",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
      { $unwind: "$staffInfo" },
      {
        $group: {
          _id: "$staff",
          staffName: { $first: "$staffInfo.name" },
          staffEmail: { $first: "$staffInfo.email" },
          total: { $sum: 1 },
          released: { $sum: { $cond: [{ $eq: ["$status", "Released"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          staffId: "$_id",
          staffName: 1,
          staffEmail: 1,
          total: 1,
          released: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayslips,
        releasedThisMonth,
        pendingPayslips,
        groupedByStaff: grouped,
      },
    });
  } catch (err) {
    console.error("Error fetching payslip stats:", err);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};
