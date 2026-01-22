
import mongoose from "mongoose";

const salaryRecipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. Kitchen Staff Recipe

    components: [
      {
        name: String,               // BASIC, HRA, DA, OT
        type: {
          type: String,
          enum: ["EARNING", "DEDUCTION"],
          required: true,
        },
        calcType: {
          type: String,
          enum: ["FIXED", "PERCENTAGE"],
          required: true,
        },
        value: Number,              // 40 (%), 8000 (₹)
        prorate: { type: Boolean, default: true }, // attendance based?
      },
    ],

    workingDays: { type: Number, default: 26 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SalaryRecipe ||
  mongoose.model("SalaryRecipe", salaryRecipeSchema);
