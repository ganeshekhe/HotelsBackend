
import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
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
       ITEM NAME
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // 🔥 Paneer / PANEER / paneer → same
    },

    /* =========================
       PRICE
    ========================= */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       CATEGORY (TENANT SAFE)
    ========================= */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },

    /* =========================
       AVAILABILITY
    ========================= */
    isAvailable: {
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
   UNIQUE ITEM PER TENANT + CATEGORY
========================= */
menuItemSchema.index(
  { tenantId: 1, category: 1, name: 1 },
  { unique: true }
);

/* =========================
   HOT RELOAD SAFE
========================= */
export default mongoose.models.MenuItem ||
  mongoose.model("MenuItem", menuItemSchema);
