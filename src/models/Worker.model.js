
import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    // 🔐 MULTI-TENANT ISOLATION (MANDATORY)
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      enum: ["KITCHEN", "WAITER", "HOUSEKEEPING", "CASHIER"],
      required: true
    },

    salaryType: {
      type: String,
      enum: ["MONTHLY", "DAILY", "HOURLY"],
      required: true
    },

    // 🔹 Base Salary
    salaryAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // 🔹 Salary Structure (ERP LEVEL)
    salaryRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryRecipe"
    },

    joiningDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// 🔐 One worker name per tenant (optional but recommended)
workerSchema.index({ tenantId: 1, name: 1 });

// 🔐 VERY IMPORTANT (HOT RELOAD SAFE)
export default mongoose.models.Worker ||
  mongoose.model("Worker", workerSchema);
