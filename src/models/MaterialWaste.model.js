import mongoose from "mongoose";

const materialWasteSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },

    reason: {
      type: String,
      enum: ["SPOILED", "BURNT", "EXPIRED", "CANCELLED_ORDER", "OTHER"],
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    // 🔥 VERY IMPORTANT (ERP COST)
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MaterialWaste ||
  mongoose.model("MaterialWaste", materialWasteSchema);
