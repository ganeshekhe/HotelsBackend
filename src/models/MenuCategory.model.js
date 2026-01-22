

import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
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
       CATEGORY NAME
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // 🔥 Veg, VEG, veg → all same
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
   UNIQUE PER TENANT
========================= */
menuCategorySchema.index(
  { tenantId: 1, name: 1 },
  { unique: true }
);

/* =========================
   HOT RELOAD SAFE
========================= */
export default mongoose.models.MenuCategory ||
  mongoose.model("MenuCategory", menuCategorySchema);
