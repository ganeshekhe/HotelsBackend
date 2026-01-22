
import Bill from "../models/Bill.model.js";
import Order from "../models/Order.model.js";
import Table from "../models/Table.model.js";
// import { generateBillPDF } from "../utils/pdfGenerator.js";

/* =====================================================
   🟢 CREATE BILL (ERP LEVEL – ITEM SNAPSHOT)
===================================================== */
export const createBill = async (req, res) => {
  try {
    const { orderId, paidAmount, paymentMode, discount = 0 } = req.body;

    if (!orderId || paymentMode === undefined || paidAmount === undefined) {
      return res.status(400).json({ message: "Missing bill data" });
    }

    /* =========================
       FETCH ORDER (TENANT SAFE)
    ========================= */
    const order = await Order.findOne({
      _id: orderId,
      tenantId: req.user.tenantId,
    })
      .populate("table", "name")
      .populate("items.menuItem", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res
        .status(400)
        .json({ message: "Bill already generated" });
    }

    /* =========================
       CALCULATIONS
    ========================= */
    const gstAmount = Number(
      (order.totalAmount * 0.05).toFixed(2)
    );

    const safeDiscount =
      discount > order.totalAmount ? order.totalAmount : discount;

    const grandTotal = Number(
      (order.totalAmount + gstAmount - safeDiscount).toFixed(2)
    );

    /* =========================
       🔥 ITEM SNAPSHOT
    ========================= */
    const billItems = order.items.map((i) => ({
      name: i.menuItem?.name || "Item",
      quantity: i.quantity,
      price: i.price,
      total: Number((i.quantity * i.price).toFixed(2)),
    }));

    /* =========================
       CREATE BILL
    ========================= */
    const bill = await Bill.create({
      tenantId: req.user.tenantId,
      order: order._id,
      table: order.table._id,

      items: billItems,

      totalAmount: order.totalAmount,
      gstAmount,
      discount: safeDiscount,
      grandTotal,
      paidAmount,
      paymentMode,
      createdBy: req.user._id,
    });

    /* =========================
       UPDATE ORDER + TABLE
    ========================= */
    order.paymentStatus = "PAID";
    order.status = "SERVED";
    await order.save();

    await Table.findOneAndUpdate(
      {
        _id: order.table._id,
        tenantId: req.user.tenantId,
      },
      { status: "AVAILABLE" }
    );

    res.status(201).json(bill);
  } catch (err) {
    console.error("CREATE BILL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🟡 GET ALL BILLS (TENANT WISE)
===================================================== */
export const getBills = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const bills = await Bill.find(filter)
      .populate("table", "name")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error("GET BILLS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
