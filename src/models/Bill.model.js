
import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    /* =========================
       TENANT / ORDER INFO
    ========================= */
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    /* =========================
       🔥 BILL ITEMS SNAPSHOT
       (ERP LEVEL – PRINT SAFE)
    ========================= */
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    /* =========================
       AMOUNTS
    ========================= */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ["CASH", "CARD", "UPI"],
      required: true,
    },

    /* =========================
       PDF / AUDIT
    ========================= */
    pdfPath: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* =========================
   INDEXES (ERP FAST REPORTS)
========================= */
billSchema.index({ tenantId: 1, createdAt: -1 });

/* =========================
   HOT RELOAD SAFE EXPORT
========================= */
export default mongoose.models.Bill ||
  mongoose.model("Bill", billSchema);
