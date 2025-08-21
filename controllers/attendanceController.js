// controllers/attendance.controller.js
// Full attendance controller with 3 geo-fenced check-ins, holiday logic, offdays, and enriched admin view.

const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const Attendance = require('../models/attendance');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Emergency = require('../models/emergency');
const SickSheet = require('../models/sickSheet');
const OffDay = require('../models/offday'); // <-- create if you don't have it

// ===============================
// Config
// ===============================
const GEO_DEFAULT_RADIUS_M = 100;

// 3 daily check-in segments (adjust times as needed)
const SEGMENTS = {
  morning: { key: 'morning', label: 'Morning', window: { start: '05:00', end: '10:59' } },
  midday:  { key: 'midday',  label: 'Midday',  window: { start: '11:00', end: '15:59' } },
  evening: { key: 'evening', label: 'Evening', window: { start: '16:00', end: '23:59' } },
};
const SEGMENT_KEYS = Object.keys(SEGMENTS); // ['morning', 'midday', 'evening']

// Kenyan public holidays 2024-2025 (example)
const holidays = [
  // 2024
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-03-29', name: "Good Friday" },
  { date: '2024-04-01', name: "Easter Monday" },
  { date: '2024-05-01', name: "Labour Day" },
  { date: '2024-06-01', name: "Madaraka Day" },
  { date: '2024-10-10', name: "Huduma Day" },
  { date: '2024-10-20', name: "Mashujaa Day" },
  { date: '2024-12-12', name: "Jamhuri Day" },
  { date: '2024-12-25', name: "Christmas Day" },
  { date: '2024-12-26', name: "Boxing Day" },
  // 2025
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-04-18', name: "Good Friday" },
  { date: '2025-04-21', name: "Easter Monday" },
  { date: '2025-05-01', name: "Labour Day" },
  { date: '2025-06-01', name: "Madaraka Day" },
  { date: '2025-10-10', name: "Huduma Day" },
  { date: '2025-10-20', name: "Mashujaa Day" },
  { date: '2025-12-12', name: "Jamhuri Day" },
  { date: '2025-12-25', name: "Christmas Day" },
  { date: '2025-12-26', name: "Boxing Day" },
];

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ===============================
// Utils
// ===============================
const toDateOnlyStr = (d) => new Date(d).toISOString().split('T')[0];

const isHoliday = (date) => {
  const ds = toDateOnlyStr(date);
  return holidays.find((h) => h.date === ds) || null;
};

const parseTimeIntoDate = (baseDate, HHMM) => {
  const [h, m] = HHMM.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
};

const isNowInWindow = (date, startHHMM, endHHMM) => {
  const now = new Date();
  const start = parseTimeIntoDate(date, startHHMM);
  const end = parseTimeIntoDate(date, endHHMM);
  return now >= start && now <= end;
};

// Haversine distance in meters (no external deps)
const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// Choose segment (if not provided) based on current time
const inferCurrentSegmentKey = (baseDate) => {
  for (const key of SEGMENT_KEYS) {
    const seg = SEGMENTS[key];
    if (isNowInWindow(baseDate, seg.window.start, seg.window.end)) return key;
  }
  // If outside windows, default to nearest logical segment (evening after midnight, etc.)
  // Here we fallback to 'morning' for simplicity.
  return 'morning';
};

// Ensure attendance doc for (staff, shift, day)
const ensureAttendanceDoc = async ({ staffId, shiftId, dateOnly }) => {
  const dayStart = new Date(dateOnly);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  let doc = await Attendance.findOne({
    staff: staffId,
    shift: shiftId,
    date: { $gte: dayStart, $lt: dayEnd },
  });

  if (!doc) {
    const holidayInfo = isHoliday(dayStart);
    doc = await Attendance.create({
      staff: staffId,
      shift: shiftId,
      date: dayStart,
      status: 'Absent - No Proof',
      isHoliday: !!holidayInfo,
      holidayName: holidayInfo?.name || null,
      doublePay: false,
      sessions: {
        morning: { checkIn: null, checkOut: null },
        midday: { checkIn: null, checkOut: null },
        evening: { checkIn: null, checkOut: null },
      },
    });
  }
  return doc;
};

// Compute hours from sessions
const computeTotalHours = (sessions) => {
  if (!sessions) return 0;
  const sum = (s) =>
    s?.checkIn && s?.checkOut ? (new Date(s.checkOut) - new Date(s.checkIn)) / (1000 * 60 * 60) : 0;
  const total = sum(sessions.morning) + sum(sessions.midday) + sum(sessions.evening);
  return Math.round(total * 100) / 100;
};

// Final status resolver with required priorities
const resolveFinalStatus = ({
  baseStatus, // current status ('Present'/'Late'/'Absent - No Proof' etc.)
  isHolidayFlag,
  holidayName,
  workedToday, // any session had a check-in
  anyApprovedSick,
  anyApprovedEmergency,
  anyApprovedOffDay,
}) => {
  // 1) Offday beats everything
  if (anyApprovedOffDay) return 'Offday';

  // 2) Sick/Emergency (approved) beats “Absent - No Proof”
  if (!workedToday && anyApprovedSick) return 'On Sick Leave';
  if (!workedToday && anyApprovedEmergency) return 'Emergency Leave';

  // 3) Holiday conditions
  if (isHolidayFlag && workedToday) {
    return holidayName ? `Holiday - Worked (${holidayName}) - Double Pay` : 'Holiday - Worked - Double Pay';
  }
  if (isHolidayFlag && !workedToday) {
    return holidayName ? `Holiday - Absent (${holidayName})` : 'Holiday - Absent';
  }

  // 4) If worked: Present (or Late if you track lateness per first segment check-in)
  if (workedToday) return baseStatus === 'Late' ? 'Late' : 'Present';

  // 5) Default
  return 'Absent - No Proof';
};

// Holiday names list for aggregation
const HOLIDAY_DATES = holidays.map((h) => h.date);

// ===============================
// Notifications (email for emergencies approval flows)
// ===============================
const sendAdminNotification = async (emergencyData, userData) => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@company.com'];
    const emailContent = {
      from: process.env.SMTP_USER,
      to: adminEmails,
      subject: `🚨 Emergency Request - ${emergencyData.type} | ${userData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">🚨 New Emergency Request</h2>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
            <h3>Employee Details</h3>
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Service Number:</strong> ${userData.serviceNumber}</p>
            <p><strong>Department:</strong> ${userData.department || 'N/A'}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <h3>Emergency Details</h3>
            <p><strong>Type:</strong> ${emergencyData.type}</p>
            <p><strong>Date:</strong> ${new Date(emergencyData.date).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> ${emergencyData.reason}</p>
            ${emergencyData.description ? `<p><strong>Description:</strong> ${emergencyData.description}</p>` : ''}
            <h3>Attachments</h3>
            ${
              emergencyData.attachments?.length
                ? `<ul>${emergencyData.attachments.map((f) => `<li>${f.originalName || f}</li>`).join('')}</ul>`
                : '<p style="color:#666"><i>No attachments provided</i></p>'
            }
            <div style="background:#fff3cd;border:1px solid #ffeaa7;padding:15px;border-radius:4px;margin-top:20px;">
              <p style="margin:0;color:#856404;"><strong>⏰ Action Required:</strong> Review in the admin portal.</p>
            </div>
          </div>
          <div style="background:#343a40;color:white;padding:15px;text-align:center;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-size:12px;">Automated Attendance System</p>
          </div>
        </div>
      `,
    };
    await emailTransporter.sendMail(emailContent);
  } catch (err) {
    console.error('Error sending admin notification:', err);
  }
};

// ===============================
// Controllers
// ===============================

// ---------- GEO-FENCED 3x CHECK-IN ----------
exports.checkInSegment = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { shiftId, lat, lng, segment } = req.body;

    if (!shiftId || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'shiftId, lat and lng are required.' });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });

    const shiftDateStr = toDateOnlyStr(shift.shiftDate);
    const todayStr = toDateOnlyStr(new Date());
    if (shiftDateStr !== todayStr) {
      return res.status(400).json({ success: false, message: 'Check-in allowed only on the shift date.' });
    }

    // Geofence check
    const radius = shift.radiusMeters || GEO_DEFAULT_RADIUS_M;
    if (shift.latitude == null || shift.longitude == null) {
      return res.status(400).json({ success: false, message: 'Shift location coordinates missing.' });
    }
    const distance = haversineMeters(Number(lat), Number(lng), Number(shift.latitude), Number(shift.longitude));
    if (distance > radius) {
      return res.status(400).json({
        success: false,
        message: `Check-in denied. You must be within ${radius}m. Current distance: ${Math.round(distance)}m`,
      });
    }

    // Ensure attendance doc
    const attendance = await ensureAttendanceDoc({ staffId, shiftId, dateOnly: shift.shiftDate });

    // Determine segment
    const segKey = segment && SEGMENTS[segment] ? segment : inferCurrentSegmentKey(shift.shiftDate);
    const seg = attendance.sessions?.[segKey] || { checkIn: null, checkOut: null };

    if (seg.checkIn) {
      return res.status(400).json({
        success: false,
        message: `${SEGMENTS[segKey].label} check-in already recorded.`,
      });
    }

    // Mark check-in
    seg.checkIn = new Date();
    attendance.sessions[segKey] = seg;

    // Late if first segment check-in is after shift start time
    // Determine lateness only for the first check-in of the day
    const hadAnyCheckIn =
      (attendance.sessions.morning?.checkIn ||
        attendance.sessions.midday?.checkIn ||
        attendance.sessions.evening?.checkIn) && segKey !== 'morning';
    if (!hadAnyCheckIn) {
      const shiftStartTime = String(shift.shiftTime || '06:00-18:00').split('-')[0];
      const shiftStart = new Date(`${shiftDateStr}T${shiftStartTime}:00.000Z`);
      attendance.status = new Date(seg.checkIn) > shiftStart ? 'Late' : 'Present';
      attendance.checkInTime = seg.checkIn;
    }

    // Holiday + doublePay marker if worked
    const holidayInfo = isHoliday(shift.shiftDate);
    attendance.isHoliday = !!holidayInfo;
    attendance.holidayName = holidayInfo?.name || null;
    attendance.doublePay = !!holidayInfo; // only paid if any session worked; final status resolver handles this text

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `${SEGMENTS[segKey].label} check-in successful`,
      data: attendance,
      meta: { distance: Math.round(distance), radius },
    });
  } catch (err) {
    console.error('Error in checkInSegment:', err);
    res.status(500).json({ success: false, message: 'Server error during check-in' });
  }
};

// Optional but recommended: segment check-out (for hours calc)
exports.checkOutSegment = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { shiftId, segment } = req.body;

    if (!shiftId) return res.status(400).json({ success: false, message: 'shiftId is required.' });

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });

    const attendance = await ensureAttendanceDoc({ staffId, shiftId, dateOnly: shift.shiftDate });

    const segKey = segment && SEGMENTS[segment] ? segment : inferCurrentSegmentKey(shift.shiftDate);
    const seg = attendance.sessions?.[segKey];

    if (!seg || !seg.checkIn) {
      return res.status(400).json({
        success: false,
        message: `${SEGMENTS[segKey].label} check-in not found. Cannot check-out.`,
      });
    }
    if (seg.checkOut) {
      return res.status(400).json({
        success: false,
        message: `${SEGMENTS[segKey].label} check-out already recorded.`,
      });
    }

    seg.checkOut = new Date();
    attendance.sessions[segKey] = seg;

    attendance.hoursWorked = computeTotalHours(attendance.sessions);
    attendance.checkOutTime = seg.checkOut;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `${SEGMENTS[segKey].label} check-out successful`,
      data: attendance,
    });
  } catch (err) {
    console.error('Error in checkOutSegment:', err);
    res.status(500).json({ success: false, message: 'Server error during check-out' });
  }
};

// ---------- CREATE EMERGENCY (with admin notification) ----------
exports.createEmergencyRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, date, reason, description, attachments } = req.body;

    if (!type || !date || !reason) {
      return res.status(400).json({ success: false, message: 'Type, date and reason are required' });
    }

    const userData = await User.findById(userId).select('name serviceNumber email department county');
    if (!userData) return res.status(404).json({ success: false, message: 'User not found' });

    const emergencyData = {
      user: userId,
      type,
      date: new Date(date),
      reason,
      description,
      attachments: attachments || [],
      status: 'pending',
      submittedAt: new Date(),
    };

    const emergency = await Emergency.create(emergencyData);
    sendAdminNotification(emergencyData, userData).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Emergency request submitted. Admin notified.',
      data: emergency,
    });
  } catch (err) {
    console.error('Error creating emergency request:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ---------- ADMIN: ENRICHED GET ALL ATTENDANCE ----------
exports.getAllAttendance = async (req, res) => {
  try {
    const { staff, date, status, site, page = 1, limit = 50, county, location } = req.query;

    // Date filter (default to current month)
    let dateFilter = {};
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      dateFilter = { $gte: d, $lt: next };
    } else {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const pipeline = [
      {
        $match: {
          ...(staff && { staff: new mongoose.Types.ObjectId(staff) }),
          ...(status && { status }),
          ...(Object.keys(dateFilter).length && { date: dateFilter }),
        },
      },
      // join user + shift
      { $lookup: { from: 'users', localField: 'staff', foreignField: '_id', as: 'staffDetails' } },
      { $lookup: { from: 'shifts', localField: 'shift', foreignField: '_id', as: 'shiftDetails' } },

      // emergencies on same day
      {
        $lookup: {
          from: 'emergencies',
          let: { staffId: '$staff', attendanceDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$staffId'] },
                    {
                      $eq: [
                        { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        { $dateToString: { format: '%Y-%m-%d', date: '$$attendanceDate' } },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'emergencyRequests',
        },
      },

      // sick sheets covering the date
      {
        $lookup: {
          from: 'sicksheets',
          let: { staffId: '$staff', attendanceDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$staffId'] },
                    {
                      $or: [
                        {
                          $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: '$$attendanceDate' } },
                          ],
                        },
                        {
                          $and: [
                            { $lte: ['$startDate', '$$attendanceDate'] },
                            { $gte: ['$endDate', '$$attendanceDate'] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'sickSheets',
        },
      },

      // offdays covering the date
      {
        $lookup: {
          from: 'offdays',
          let: { staffId: '$staff', attendanceDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$staffId'] },
                    { $eq: ['$status', 'approved'] },
                    {
                      $and: [
                        { $lte: ['$startDate', '$$attendanceDate'] },
                        { $gte: ['$endDate', '$$attendanceDate'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'offDays',
        },
      },

      {
        $addFields: {
          staff: { $arrayElemAt: ['$staffDetails', 0] },
          shift: { $arrayElemAt: ['$shiftDetails', 0] },

          isHolidayDate: {
            $in: [{ $dateToString: { format: '%Y-%m-%d', date: '$date' } }, HOLIDAY_DATES],
          },
          holidayName: {
            $let: {
              vars: {
                match: {
                  $filter: {
                    input: holidays.map((h) => ({ date: h.date, name: h.name })),
                    cond: { $eq: ['$$this.date', { $dateToString: { format: '%Y-%m-%d', date: '$date' } }] },
                  },
                },
              },
              in: { $arrayElemAt: ['$$match.name', 0] },
            },
          },

          approvedSickSheets: {
            $filter: { input: '$sickSheets', cond: { $eq: ['$$this.status', 'approved'] } },
          },
          approvedEmergencies: {
            $filter: { input: '$emergencyRequests', cond: { $eq: ['$$this.status', 'approved'] } },
          },

          hasProof: {
            $or: [
              { $gt: [{ $size: '$approvedSickSheets' }, 0] },
              { $gt: [{ $size: '$approvedEmergencies' }, 0] },
            ],
          },
          hasApprovedOffDay: { $gt: [{ $size: '$offDays' }, 0] },

          workedToday: {
            $or: [
              { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.morning' } }, null] },
              { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.midday' } }, null] },
              { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.evening' } }, null] },
            ],
          },
        },
      },

      // finally, project everything + final status assembled on API layer
      {
        $match: {
          ...(site && { 'shift.site': site }),
          ...(county && { 'staff.county': county }),
          ...(location && { 'shift.location': location }),
        },
      },
      { $sort: { date: -1, 'staff.name': 1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          staff: {
            _id: '$staff._id',
            name: '$staff.name',
            serviceNumber: '$staff.serviceNumber',
            email: '$staff.email',
            department: '$staff.department',
            county: '$staff.county',
          },
          shift: {
            _id: '$shift._id',
            shiftTime: '$shift.shiftTime',
            shiftDate: '$shift.shiftDate',
            site: '$shift.site',
            location: '$shift.location',
            latitude: '$shift.latitude',
            longitude: '$shift.longitude',
          },
          date: 1,
          sessions: 1,
          checkInTime: 1,
          checkOutTime: 1,
          status: 1,
          isHoliday: '$isHolidayDate',
          holidayName: 1,
          hasProof: 1,
          hasApprovedOffDay: 1,
          approvedSickSheets: 1,
          approvedEmergencies: 1,
          totalHours: '$hoursWorked',
          workedToday: 1,
        },
      },
    ];

    // Execute
    const [rows, countArr] = await Promise.all([
      Attendance.aggregate(pipeline),
      Attendance.aggregate([
        {
          $match: {
            ...(staff && { staff: new mongoose.Types.ObjectId(staff) }),
            ...(status && { status }),
            ...(Object.keys(dateFilter).length && { date: dateFilter }),
          },
        },
        { $count: 'total' },
      ]),
    ]);

    // Attach finalStatus per row here (cleanest way)
    const enriched = rows.map((r) => {
      const finalStatus = resolveFinalStatus({
        baseStatus: r.status,
        isHolidayFlag: r.isHoliday,
        holidayName: r.holidayName,
        workedToday: r.workedToday,
        anyApprovedSick: (r.approvedSickSheets || []).length > 0,
        anyApprovedEmergency: (r.approvedEmergencies || []).length > 0,
        anyApprovedOffDay: !!r.hasApprovedOffDay,
      });

      // Double pay only if holiday + worked
      const doublePay = r.isHoliday && r.workedToday;

      // Proof details
      const proofDetails = [];
      (r.approvedSickSheets || []).forEach((s) =>
        proofDetails.push({
          type: 'Sick Sheet',
          status: s.status,
          startDate: s.startDate,
          endDate: s.endDate,
          attachments: s.attachments,
          reason: s.reason,
        })
      );
      (r.approvedEmergencies || []).forEach((e) =>
        proofDetails.push({
          type: `Emergency - ${e.type}`,
          status: e.status,
          date: e.date,
          attachments: e.attachments,
          reason: e.reason,
          description: e.description,
        })
      );
      if (r.hasApprovedOffDay) {
        proofDetails.push({ type: 'Offday', status: 'approved' });
      }

      return {
        ...r,
        finalStatus,
        doublePay,
        proofDetails,
      };
    });

    const total = countArr?.[0]?.total || 0;
    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalRecords: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (err) {
    console.error('Error getAllAttendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ---------- SIMPLE "MY ATTENDANCE" ----------
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ staff: req.user.id }).populate('shift').sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    console.error('Error getMyAttendance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- ATTENDANCE SUMMARY (date range) ----------
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, staff } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const pipe = [
      {
        $match: {
          date: { $gte: start, $lte: end },
          ...(staff && { staff: new mongoose.Types.ObjectId(staff) }),
        },
      },
      { $lookup: { from: 'users', localField: 'staff', foreignField: '_id', as: 'staffDetails' } },
      {
        $group: {
          _id: '$staff',
          staffName: { $first: { $arrayElemAt: ['$staffDetails.name', 0] } },
          serviceNumber: { $first: { $arrayElemAt: ['$staffDetails.serviceNumber', 0] } },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'Present'] },
                    { $eq: ['$status', 'Late'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'Absent - No Proof'] }, 1, 0] } },
          holidayDays: { $sum: { $cond: ['$isHoliday', 1, 0] } },
          totalHours: { $sum: '$hoursWorked' },
        },
      },
      { $sort: { staffName: 1 } },
    ];

    const summary = await Attendance.aggregate(pipe);
    res.status(200).json({
      success: true,
      data: summary,
      period: { start: toDateOnlyStr(start), end: toDateOnlyStr(end) },
    });
  } catch (err) {
    console.error('Error getAttendanceSummary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- DASHBOARD STATS (today) ----------
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStats = await Attendance.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $lookup: { from: 'shifts', localField: 'shift', foreignField: '_id', as: 'shiftDetails' } },
      { $addFields: { shift: { $arrayElemAt: ['$shiftDetails', 0] } } },
      {
        $group: {
          _id: null,
          totalCheckedIn: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.morning' } }, null] },
                    { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.midday' } }, null] },
                    { $ne: [{ $getField: { field: 'checkIn', input: '$sessions.evening' } }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          holidayWorkers: { $sum: { $cond: ['$isHoliday', 1, 0] } },
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          lateCount: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'Absent - No Proof'] }, 1, 0] } },
        },
      },
    ]);

    const [pendingSickSheets, pendingEmergencies, totalEmployees] = await Promise.all([
      SickSheet.countDocuments({ status: 'pending' }),
      Emergency.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $ne: 'admin' } }),
    ]);

    const stats = todayStats[0] || {
      totalCheckedIn: 0,
      holidayWorkers: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        pendingSickSheets,
        pendingEmergencies,
        pendingApprovals: pendingSickSheets + pendingEmergencies,
        totalEmployees,
      },
    });
  } catch (err) {
    console.error('Error getDashboardStats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- APPROVALS ----------
exports.approveEmergencyRequest = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { action, adminComments } = req.body;

    const emergency = await Emergency.findById(emergencyId).populate('user');
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    emergency.status = action === 'approve' ? 'approved' : 'rejected';
    emergency.adminComments = adminComments || null;
    emergency.reviewedAt = new Date();
    emergency.reviewedBy = req.user.id;
    await emergency.save();

    res.status(200).json({ success: true, message: `Emergency ${action}d`, data: emergency });
  } catch (err) {
    console.error('Error approveEmergencyRequest:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveSickSheet = async (req, res) => {
  try {
    const { sickSheetId } = req.params;
    const { action, adminComments } = req.body;

    const sickSheet = await SickSheet.findById(sickSheetId).populate('user');
    if (!sickSheet) return res.status(404).json({ success: false, message: 'Sick sheet not found' });

    sickSheet.status = action === 'approve' ? 'approved' : 'rejected';
    sickSheet.adminComments = adminComments || null;
    sickSheet.reviewedAt = new Date();
    sickSheet.reviewedBy = req.user.id;
    await sickSheet.save();

    res.status(200).json({ success: true, message: `Sick sheet ${action}d`, data: sickSheet });
  } catch (err) {
    console.error('Error approveSickSheet:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const [pendingEmergencies, pendingSickSheets] = await Promise.all([
      Emergency.find({ status: 'pending' })
        .populate('user', 'name serviceNumber email department')
        .sort({ submittedAt: -1 }),
      SickSheet.find({ status: 'pending' })
        .populate('user', 'name serviceNumber email department')
        .sort({ createdAt: -1 }),
    ]);

    const approvals = [
      ...pendingEmergencies.map((e) => ({
        _id: e._id,
        type: 'emergency',
        employee: e.user,
        requestType: e.type,
        date: e.date,
        reason: e.reason,
        description: e.description,
        attachments: e.attachments,
        submittedAt: e.submittedAt,
        urgency: ['medical', 'death'].includes((e.type || '').toLowerCase()) ? 'high' : 'medium',
      })),
      ...pendingSickSheets.map((s) => ({
        _id: s._id,
        type: 'sicksheet',
        employee: s.user,
        requestType: 'Sick Leave',
        startDate: s.startDate,
        endDate: s.endDate,
        reason: s.reason,
        attachments: s.attachments,
        submittedAt: s.createdAt,
        urgency: 'medium',
      })),
    ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.status(200).json({
      success: true,
      data: approvals,
      summary: {
        total: approvals.length,
        emergencies: pendingEmergencies.length,
        sickSheets: pendingSickSheets.length,
        highUrgency: approvals.filter((a) => a.urgency === 'high').length,
      },
    });
  } catch (err) {
    console.error('Error getPendingApprovals:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- RECENT CHECK-INS ----------
exports.getRecentCheckIns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const recent = await Attendance.find({
      $or: [
        { 'sessions.morning.checkIn': { $ne: null } },
        { 'sessions.midday.checkIn': { $ne: null } },
        { 'sessions.evening.checkIn': { $ne: null } },
      ],
    })
      .populate('staff', 'name serviceNumber department')
      .populate('shift', 'shiftTime location site latitude longitude')
      .sort({ updatedAt: -1 })
      .limit(limit);

    const data = recent.map((a) => {
      const holidayInfo = isHoliday(a.date);
      return {
        _id: a._id,
        employee: {
          name: a.staff.name,
          serviceNumber: a.staff.serviceNumber,
          department: a.staff.department,
        },
        site: a.shift.site,
        location: a.shift.location,
        checkIns: {
          morning: a.sessions?.morning?.checkIn,
          midday: a.sessions?.midday?.checkIn,
          evening: a.sessions?.evening?.checkIn,
        },
        status: a.status,
        isHoliday: !!holidayInfo,
        holidayName: holidayInfo?.name || null,
        doublePay: !!holidayInfo && (
          a.sessions?.morning?.checkIn || a.sessions?.midday?.checkIn || a.sessions?.evening?.checkIn
        ),
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error getRecentCheckIns:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- SIMPLE COUNTS FOR A USER ----------
exports.countAttendanceDays = async (req, res) => {
  try {
    const userId = req.user.id;
    const present = await Attendance.countDocuments({ staff: userId, status: 'Present' });
    const late = await Attendance.countDocuments({ staff: userId, status: 'Late' });
    const absent = await Attendance.countDocuments({ staff: userId, status: 'Absent - No Proof' });
    const holidaysWorked = await Attendance.countDocuments({
      staff: userId,
      isHoliday: true,
      $or: [
        { 'sessions.morning.checkIn': { $ne: null } },
        { 'sessions.midday.checkIn': { $ne: null } },
        { 'sessions.evening.checkIn': { $ne: null } },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        present,
        late,
        absent,
        holidaysWorked,
        total: present + late + absent,
      },
    });
  } catch (err) {
    console.error('Error countAttendanceDays:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
