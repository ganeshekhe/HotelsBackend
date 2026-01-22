



// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import mongoose from "mongoose";
// import cookieParser from "cookie-parser";
// import http from "http";
// import { Server } from "socket.io";
// import path from "path";

// // 🔥 ROUTES
// import authRoutes from "./routes/auth.routes.js";
// import tenantRoutes from "./routes/tenant.routes.js";
// import menuCategoryRoutes from "./routes/menuCategory.routes.js";
// import menuItemRoutes from "./routes/menuItem.routes.js";
// import tableRoutes from "./routes/table.routes.js";
// import orderRoutes from "./routes/order.routes.js";
// import billRoutes from "./routes/bill.routes.js";
// import reportRoutes from "./routes/report.routes.js";
// import materialRoutes from "./routes/material.routes.js";
// import purchaseRoutes from "./routes/purchase.routes.js";
// import inventoryRoutes from "./routes/inventory.routes.js";
// import recipeRoutes from "./routes/recipe.routes.js";
// import workerRoutes from "./routes/worker.routes.js";
// import attendanceRoutes from "./routes/attendance.routes.js";
// import payrollRoutes from "./routes/payroll.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import materialWasteRoutes from "./routes/materialWaste.routes.js";

// // 🔥 ERROR HANDLER
// import errorHandler from "./middleware/error.middleware.js";

// dotenv.config();

// /* =====================================================
//    EXPRESS + HTTP + SOCKET SETUP
// ===================================================== */
// const app = express();
// app.set("trust proxy", 1);

// const server = http.createServer(app);

// /* =====================================================
//    🔔 SOCKET.IO INSTANCE (TENANT AWARE)
// ===================================================== */
// export const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//   },
// });

// /* =====================================================
//    🌍 CORS
// ===================================================== */
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );

// /* =====================================================
//    🧩 GLOBAL MIDDLEWARES
// ===================================================== */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // ✅ SAFE ADD
// app.use(cookieParser());

// /* =====================================================
//    📂 STATIC FILES (BILLS PDF)
//    http://localhost:5000/uploads/bills/xxx.pdf
// ===================================================== */
// const uploadsPath = path.resolve(process.cwd(), "uploads");
// app.use("/uploads", express.static(uploadsPath));

// /* =====================================================
//    🚦 API ROUTES
// ===================================================== */
// app.use("/api/auth", authRoutes);
// app.use("/api/tenants", tenantRoutes); // 🔥 SUPER_ADMIN ONLY

// app.use("/api/menu-categories", menuCategoryRoutes);
// app.use("/api/menu-items", menuItemRoutes);
// app.use("/api/tables", tableRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/bills", billRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/materials", materialRoutes);
// app.use("/api/purchases", purchaseRoutes);
// app.use("/api/inventory", inventoryRoutes);
// app.use("/api/recipes", recipeRoutes);
// app.use("/api/workers", workerRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/payroll", payrollRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/material-waste", materialWasteRoutes);

// /* =====================================================
//    ❌ GLOBAL ERROR HANDLER
// ===================================================== */
// app.use(errorHandler);

// /* =====================================================
//    🔔 SOCKET.IO CONNECTION HANDLER (TENANT ROOMS)
// ===================================================== */
// io.on("connection", (socket) => {
//   console.log("🟢 Socket connected:", socket.id);

//   /**
//    * Client must send tenantId while connecting:
//    * io(url, { auth: { tenant: tenantId } })
//    */
//   const tenantId = socket.handshake.auth?.tenant;

//   if (tenantId) {
//     socket.join(`tenant:${tenantId}`);
//     console.log(`🏢 Joined tenant room: tenant:${tenantId}`);
//   }

//   socket.on("disconnect", () => {
//     console.log("🔴 Socket disconnected:", socket.id);
//   });
// });

// /* =====================================================
//    🛢️ DATABASE + SERVER START
// ===================================================== */
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");

//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import path from "path";

// 🔥 ROUTES
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import menuCategoryRoutes from "./routes/menuCategory.routes.js";
import menuItemRoutes from "./routes/menuItem.routes.js";
import tableRoutes from "./routes/table.routes.js";
import orderRoutes from "./routes/order.routes.js";
import billRoutes from "./routes/bill.routes.js";
import reportRoutes from "./routes/report.routes.js";
import materialRoutes from "./routes/material.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import userRoutes from "./routes/user.routes.js";
import materialWasteRoutes from "./routes/materialWaste.routes.js";

// 🔥 ERROR HANDLER
import errorHandler from "./middleware/error.middleware.js";

dotenv.config();

/* =====================================================
   EXPRESS + HTTP + SOCKET SETUP
===================================================== */
const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);

/* =====================================================
   🌍 ALLOWED ORIGINS (ENV BASED)
===================================================== */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined if env missing

/* =====================================================
   🌍 CORS (API)
===================================================== */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, postman, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =====================================================
   🔔 SOCKET.IO INSTANCE (TENANT AWARE)
===================================================== */
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

/* =====================================================
   🧩 GLOBAL MIDDLEWARES
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =====================================================
   📂 STATIC FILES (BILLS PDF)
   https://backend-url/uploads/xxx.pdf
===================================================== */
const uploadsPath = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

/* =====================================================
   🚦 API ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);

app.use("/api/menu-categories", menuCategoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/material-waste", materialWasteRoutes);

/* =====================================================
   ❌ GLOBAL ERROR HANDLER
===================================================== */
app.use(errorHandler);

/* =====================================================
   🔔 SOCKET.IO CONNECTION HANDLER (TENANT ROOMS)
===================================================== */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /**
   * Client must send tenantId:
   * io(SOCKET_URL, { auth: { tenant: tenantId } })
   */
  const tenantId = socket.handshake.auth?.tenant;

  if (tenantId) {
    socket.join(`tenant:${tenantId}`);
    console.log(`🏢 Joined tenant room: tenant:${tenantId}`);
  }

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* =====================================================
   🛢️ DATABASE + SERVER START
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
