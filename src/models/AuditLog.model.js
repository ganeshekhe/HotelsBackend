
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null, // ✅ IMPORTANT
    },

    action: {
      type: String,
      required: true,
    },

    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog; // ✅ THIS LINE WAS MISSING
