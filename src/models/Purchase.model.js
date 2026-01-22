
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    supplier: {
      type: String,
      required: true
    },

    items: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔐 Fast tenant-wise purchase queries
purchaseSchema.index({ tenantId: 1, createdAt: -1 });

// 🔐 FIX for hot reload
export default mongoose.models.Purchase ||
  mongoose.model("Purchase", purchaseSchema);
