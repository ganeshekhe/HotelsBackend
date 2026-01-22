
import Bill from "../models/Bill.model.js";
import Order from "../models/Order.model.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import Recipe from "../models/Recipe.model.js";
import MaterialWaste from "../models/MaterialWaste.model.js";
import Tenant from "../models/tenant.model.js";

// 🟢 Daily / Monthly Sales Summary (Tenant Wise)
export const getSalesSummary = async (req, res) => {
  try {
    const { range = "daily" } = req.query;

    const matchStage =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const groupFormat =
      range === "monthly"
        ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

    const summary = await Bill.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: "$grandTotal" },
          totalGST: { $sum: "$gstAmount" },
          totalDiscount: { $sum: "$discount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 PROFIT & LOSS REPORT
export const getProfitLoss = async (req, res) => {
  try {
    const { type = "daily", date, month, year } = req.query;

    const tenantId =
      req.user.role === "SUPER_ADMIN"
        ? null
        : req.user.tenantId;

    const match = {
      isDeleted: false,
      status: { $ne: "CANCELLED" },
    };

    if (tenantId) {
      match.tenantId = tenantId;
    }

    /* =========================
       DATE FILTER
    ========================= */
    let dateFilter = {};

    if (type === "daily" && date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: start, $lte: end };
      dateFilter = { $gte: start, $lte: end };
    }

    if (type === "monthly" && month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      match.createdAt = { $gte: start, $lt: end };
      dateFilter = { $gte: start, $lt: end };
    }

    if (type === "yearly" && year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999`);
      match.createdAt = { $gte: start, $lte: end };
      dateFilter = { $gte: start, $lte: end };
    }

    /* =========================
       ORDERS
    ========================= */
    const orders = await Order.find(match)
      .populate("items.menuItem");

    let totalSales = 0;
    let totalMaterialCost = 0;

    for (const order of orders) {
      totalSales += order.totalAmount;

      for (const item of order.items) {
        const recipe = await Recipe.findOne({
          tenantId: order.tenantId,
          menuItem: item.menuItem?._id,
        }).populate("materials.material");

        if (!recipe) continue;

        for (const r of recipe.materials) {
          totalMaterialCost +=
            r.quantity *
            r.material.pricePerUnit *
            item.quantity;
        }
      }
    }

    /* =========================
       WASTE COST
    ========================= */
    const wasteMatch = tenantId ? { tenantId } : {};
    if (Object.keys(dateFilter).length) {
      wasteMatch.createdAt = dateFilter;
    }

    const wasteSummary = await MaterialWaste.aggregate([
      { $match: wasteMatch },
      {
        $group: {
          _id: null,
          totalWasteCost: { $sum: "$totalCost" },
        },
      },
    ]);

    const totalWasteCost =
      wasteSummary[0]?.totalWasteCost || 0;

    /* =========================
       FINAL PROFIT / LOSS
    ========================= */
    const netProfit = Number(
      (
        totalSales -
        totalMaterialCost -
        totalWasteCost
      ).toFixed(2)
    );

    res.status(200).json({
      type,
      totalSales,
      totalMaterialCost,
      totalWasteCost,
      netProfit,
      profitStatus: netProfit >= 0 ? "PROFIT" : "LOSS",
    });
  } catch (error) {
    console.error("P&L ERROR:", error);
    res.status(500).json({
      message: "Profit & Loss calculation failed",
    });
  }
};

// 🟢 EXPORT SALES REPORT (EXCEL)
export const exportReportExcel = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const data = await Bill.find(filter).populate("table", "name");
    const tenant = await Tenant.findById(req.user.tenantId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.addRow([`Restaurant: ${tenant?.name || ""}`]);
    sheet.addRow([]);

    sheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Table", key: "table", width: 15 },
      { header: "Total", key: "total", width: 10 },
      { header: "GST", key: "gst", width: 10 },
      { header: "Discount", key: "discount", width: 10 },
      { header: "Grand Total", key: "grandTotal", width: 12 },
      { header: "Payment Mode", key: "paymentMode", width: 12 },
    ];

    data.forEach((bill) =>
      sheet.addRow({
        date: bill.createdAt.toLocaleString(),
        table: bill.table?.name,
        total: bill.totalAmount,
        gst: bill.gstAmount,
        discount: bill.discount,
        grandTotal: bill.grandTotal,
        paymentMode: bill.paymentMode,
      })
    );

    const filePath = `uploads/sales_report_${req.user.tenantId}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel export failed" });
  }
};

// 🟢 EXPORT SALES REPORT (PDF)
export const exportReportPDF = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const bills = await Bill.find(filter).populate("table", "name");
    const tenant = await Tenant.findById(req.user.tenantId);

    const doc = new PDFDocument();
    const filePath = `uploads/sales_report_${req.user.tenantId}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text(tenant?.name || "Restaurant", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("Sales Report", { align: "center" });
    doc.moveDown();

    bills.forEach((b) => {
      doc.fontSize(12).text(
        `${b.createdAt.toLocaleDateString()} - Table: ${
          b.table?.name
        } - ₹${b.grandTotal} (${b.paymentMode})`
      );
    });

    doc.end();

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF export failed" });
  }
};
