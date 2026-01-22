
import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔽 NEW FIELDS (Tenant Profile / Branding)
    address: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },

    footerNote: {
      type: String,
      default: "",
    },

    logo: {
      type: String, // GridFS filename
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
