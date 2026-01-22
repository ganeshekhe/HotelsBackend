
import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true
    },

    materials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
          required: true
        },
        quantity: {
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

// 🔐 One recipe per menu item PER TENANT
recipeSchema.index(
  { tenantId: 1, menuItem: 1 },
  { unique: true }
);

// 🔐 FIX for hot reload
export default mongoose.models.Recipe ||
  mongoose.model("Recipe", recipeSchema);
