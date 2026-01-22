
import Payroll from "../models/Payroll.model.js";
import Attendance from "../models/Attendance.model.js";
import Worker from "../models/Worker.model.js";

/**
 * 🔹 GENERATE PAYROLL
 * Attendance dayValue based calculation
 */
export const generatePayroll = async (req, res) => {
  try {
    const { workerId, month } = req.body;

    if (!workerId || !month) {
      return res.status(400).json({ message: "Worker & month required" });
    }

    // 🔐 TENANT SAFE WORKER FETCH
    const worker = await Worker.findOne({
      _id: workerId,
      tenantId: req.user.tenantId
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // 🔐 Prevent duplicate payroll (tenant-wise)
    const exists = await Payroll.findOne({
      worker: workerId,
      month,
      tenantId: req.user.tenantId
    });

    if (exists) {
      return res.status(400).json({
        message: "Payroll already generated for this month"
      });
    }

    // Month range (string dates stored as YYYY-MM-DD)
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    // 🔐 TENANT SAFE ATTENDANCE FETCH
    const attendance = await Attendance.find({
      worker: workerId,
      tenantId: req.user.tenantId,
      date: { $gte: startDate, $lte: endDate }
    });

    let presentDays = 0;
    let halfDays = 0;
    let totalDays = 0;

    attendance.forEach((a) => {
      totalDays += a.dayValue;
      if (a.status === "PRESENT") presentDays++;
      if (a.status === "HALF_DAY") halfDays++;
    });

    let perDaySalary = 0;
    let grossSalary = 0;

    if (worker.salaryType === "MONTHLY") {
      perDaySalary = worker.salaryAmount / 26;
      grossSalary = perDaySalary * totalDays;
    }

    if (worker.salaryType === "DAILY") {
      perDaySalary = worker.salaryAmount;
      grossSalary = perDaySalary * totalDays;
    }

    if (worker.salaryType === "HOURLY") {
      perDaySalary = worker.salaryAmount * 8; // 8 hrs/day
      grossSalary = perDaySalary * totalDays;
    }

    const payroll = await Payroll.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      worker: workerId,
      month,
      presentDays,
      halfDays,
      totalDays,
      perDaySalary: Math.round(perDaySalary),
      grossSalary: Math.round(grossSalary),
      netSalary: Math.round(grossSalary),
      generatedBy: req.user._id
    });

    res.status(201).json(payroll);
  } catch (err) {
    console.error("GENERATE PAYROLL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 GET PAYROLL LIST
 */
export const getPayrolls = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER_ADMIN → all tenants
    // 🔐 Others → only own tenant
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const payrolls = await Payroll.find(filter)
      .populate("worker", "name role salaryType salaryAmount")
      .sort({ createdAt: -1 });

    res.json(payrolls);
  } catch (err) {
    console.error("GET PAYROLLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
/* =====================================================
   GET SINGLE PAYROLL (PRINT SAFE)
   GET /api/payroll/:id
===================================================== */
export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findOne({
      _id: id,
      tenantId: req.user.tenantId
    })
      .populate("worker", "name role salaryType salaryAmount")
      .populate("generatedBy", "name");

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    res.json(payroll);
  } catch (err) {
    console.error("GET PAYROLL PRINT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPayrollReport = async (req, res) => {
  try {
    const { month } = req.query;

    const filter = {
      tenantId: req.user.tenantId
    };

    if (month) filter.month = month;

    const payrolls = await Payroll.find(filter)
      .populate("worker", "name role")
      .sort({ month: -1 });

    const totalSalary = payrolls.reduce(
      (sum, p) => sum + p.netSalary,
      0
    );

    res.json({
      totalSalary,
      count: payrolls.length,
      payrolls
    });
  } catch (err) {
    console.error("Payroll report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
