
import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
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
       MATERIAL NAME
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // 🔥 Sugar, SUGAR, sugar → same
    },

    /* =========================
       UNIT
    ========================= */
    unit: {
      type: String,
      required: true, // kg, L, pcs etc.
      trim: true,
      lowercase: true,
    },

    /* =========================
       STOCK DETAILS
    ========================= */
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 5, // low stock alert
      min: 0,
    },

    pricePerUnit: {
      type: Number,
      default: 0,
      min: 0,
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
   UNIQUE MATERIAL PER TENANT
========================= */
materialSchema.index(
  { tenantId: 1, name: 1 },
  { unique: true }
);

/* =========================
   HOT RELOAD SAFE
========================= */
export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);
