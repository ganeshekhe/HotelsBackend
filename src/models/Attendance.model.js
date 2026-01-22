
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["PRESENT", "HALF_DAY", "ABSENT"],
      required: true
    },

    dayValue: {
      type: Number,
      required: true
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔐 UNIQUE per tenant + worker + date
attendanceSchema.index(
  { tenantId: 1, worker: 1, date: 1 },
  { unique: true }
);

// 🔐 FIX for hot reload
export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
