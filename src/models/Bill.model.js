
// import mongoose from "mongoose";

// const billSchema = new mongoose.Schema(
//   {
//     /* =========================
//        TENANT / ORDER INFO
//     ========================= */
//     tenantId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Tenant",
//       required: true,
//       index: true,
//     },

//     order: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Order",
//       required: true,
//     },

//     table: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Table",
//       required: true,
//     },

//     /* =========================
//        🔥 BILL ITEMS SNAPSHOT
//        (ERP LEVEL – PRINT SAFE)
//     ========================= */
//     items: [
//       {
//         name: {
//           type: String,
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//         price: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//         total: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//       },
//     ],

//     /* =========================
//        AMOUNTS
//     ========================= */
//     totalAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     gstAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     grandTotal: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paidAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paymentMode: {
//       type: String,
//       enum: ["CASH", "CARD", "UPI"],
//       required: true,
//     },

//     /* =========================
//        PDF / AUDIT
//     ========================= */
//     pdfPath: {
//       type: String,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// /* =========================
//    INDEXES (ERP FAST REPORTS)
// ========================= */
// billSchema.index({ tenantId: 1, createdAt: -1 });

// /* =========================
//    HOT RELOAD SAFE EXPORT
// ========================= */
// export default mongoose.models.Bill ||
//   mongoose.model("Bill", billSchema);
import mongoose from "mongoose";

/* =========================
   BILL SCHEMA
========================= */
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
       🔥 INVOICE NUMBER (AUTO)
    ========================= */
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
   🔥 AUTO INVOICE GENERATOR
========================= */
billSchema.pre("validate", async function (next) {
  if (this.invoiceNumber) return next();

  const shortTenant = this.tenantId.toString().slice(-4);

  const lastBill = await mongoose
    .model("Bill")
    .findOne({ tenantId: this.tenantId })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastBill && lastBill.invoiceNumber) {
    const lastSeq = parseInt(lastBill.invoiceNumber.split("-").pop());
    if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
  }

  this.invoiceNumber = `INV-${shortTenant}-${String(nextNumber).padStart(4, "0")}`;

  next();
});

/* =========================
   INDEXES (ERP FAST REPORTS)
========================= */
billSchema.index({ tenantId: 1, createdAt: -1 });

/* =========================
   HOT RELOAD SAFE EXPORT
========================= */
export default mongoose.models.Bill ||
  mongoose.model("Bill", billSchema);
