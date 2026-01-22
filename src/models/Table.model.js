
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    /* =========================
       MULTI-TENANT KEY
    ========================= */
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    /* =========================
       TABLE NAME / NUMBER
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // 🔥 T1, t1, T-1 → SAME
    },

    /* =========================
       CAPACITY
    ========================= */
    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },

    /* =========================
       STATUS
    ========================= */
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED"],
      default: "AVAILABLE",
    },

    /* =========================
       ACTIVE FLAG
    ========================= */
    isActive: {
      type: Boolean,
      default: true,
    },

    /* =========================
       AUDIT
    ========================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/* =========================
   UNIQUE TABLE NAME PER TENANT
========================= */
tableSchema.index(
  { tenantId: 1, name: 1 },
  { unique: true }
);

/* =========================
   HOT RELOAD SAFE
========================= */
export default mongoose.models.Table ||
  mongoose.model("Table", tableSchema);
