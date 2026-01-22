
import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
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

    month: {
      type: String, // YYYY-MM
      required: true
    },

    presentDays: {
      type: Number,
      default: 0
    },

    halfDays: {
      type: Number,
      default: 0
    },

    totalDays: {
      type: Number,
      default: 0
    },

    perDaySalary: {
      type: Number,
      default: 0
    },

    grossSalary: {
      type: Number,
      default: 0
    },

    netSalary: {
      type: Number,
      default: 0
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔐 One payroll per worker per month per tenant
payrollSchema.index(
  { tenantId: 1, worker: 1, month: 1 },
  { unique: true }
);

// 🔐 FIX for hot reload
export default mongoose.models.Payroll ||
  mongoose.model("Payroll", payrollSchema);
