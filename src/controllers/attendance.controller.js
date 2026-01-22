
import Attendance from "../models/Attendance.model.js";
import Worker from "../models/Worker.model.js";

export const markAttendance = async (req, res) => {
  try {
    const { workerId, date, status } = req.body;

    if (!workerId || !date || !status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔐 TENANT SAFE WORKER FETCH
    const worker = await Worker.findOne({
      _id: workerId,
      tenantId: req.user.tenantId
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // 🔐 One attendance per worker per day (TENANT SAFE)
    const existing = await Attendance.findOne({
      worker: workerId,
      date,
      tenantId: req.user.tenantId
    });

    if (existing) {
      existing.status = status;
      existing.dayValue =
        status === "PRESENT" ? 1 : status === "HALF_DAY" ? 0.5 : 0;

      await existing.save();
      return res.json(existing);
    }

    const attendance = await Attendance.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      worker: workerId,
      date,
      status,
      dayValue:
        status === "PRESENT" ? 1 : status === "HALF_DAY" ? 0.5 : 0
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    let filter = {};

    // 🔐 SUPER ADMIN → ALL DATA
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    if (date) {
      filter.date = date;
    }

    const attendance = await Attendance.find(filter)
      .populate("worker", "name role");

    res.json(attendance);
  } catch (err) {
    console.error("GET ATTENDANCE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
