
import mongoose from "mongoose";

/* ---------------- ORDER ITEM SUB-SCHEMA ---------------- */
const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1, // safety guard
  },
  price: {
    type: Number,
    required: true, // capture menu item price at the time of order
    min: 0,
  },
});

/* ---------------- ORDER SCHEMA ---------------- */
const orderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    items: [orderItemSchema],

    status: {
      type: String,
      enum: ["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"],
      default: "PENDING",
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false, // soft delete support
    },
  },
  { timestamps: true }
);

/* ---------------- INDEXES ---------------- */

// 🔐 Fast tenant-wise order queries
orderSchema.index({ tenantId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, status: 1 });

/* ---------------- HOOKS ---------------- */

// Pre-save: calculate totalAmount automatically if items change
orderSchema.pre("save", function (next) {
  try {
    if (this.items && this.items.length > 0) {
      this.totalAmount = this.items.reduce(
        (acc, i) => acc + i.price * i.quantity,
        0
      );
    } else {
      this.totalAmount = 0;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// 🔐 FIX for hot reload
export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
