


import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 🔑 MULTI-TENANT KEY
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: function () {
        // SUPER_ADMIN ला tenantId नको
        return this.role !== "SUPER_ADMIN";
      },
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "HOTEL_MANAGER",
        "RESTAURANT_MANAGER",
        "RECEPTIONIST",
        "CASHIER",
        "KITCHEN",
        "HOUSEKEEPING",
        "STORE_MANAGER",
        "ACCOUNTANT",
      ],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* =========================
   PASSWORD HASH
========================= */
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔐 PASSWORD COMPARE
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
