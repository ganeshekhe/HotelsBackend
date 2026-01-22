

import Order from "../models/Order.model.js";
import Table from "../models/Table.model.js";
import MenuItem from "../models/MenuItem.model.js";
import Recipe from "../models/Recipe.model.js";
import Material from "../models/Material.model.js";

/* =====================================================
   HELPER : APPLY / REVERSE STOCK
===================================================== */
const applyStockChange = async ({
  tenantId,
  items,
  direction, // "DEDUCT" | "RESTORE"
}) => {
  for (const item of items) {
    const recipe = await Recipe.findOne({
      menuItem: item.menuItem,
      tenantId,
    }).populate("materials.material");

    if (!recipe) continue;

    for (const mat of recipe.materials) {
      const qty = mat.quantity * item.quantity;

      await Material.findOneAndUpdate(
        { _id: mat.material._id, tenantId },
        {
          $inc: {
            currentStock:
              direction === "DEDUCT" ? -qty : qty,
          },
        }
      );
    }
  }
};

/* =====================================================
   GET ALL ORDERS
===================================================== */
export const getOrders = async (req, res) => {
  try {
    let filter = { isDeleted: false };

    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const orders = await Order.find(filter)
      .populate("table", "name")
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   CREATE NEW ORDER (STOCK DEDUCT)
===================================================== */
export const createOrder = async (req, res) => {
  try {
    const { table, items } = req.body;

    if (!table || !items || !items.length) {
      return res
        .status(400)
        .json({ message: "Table & items required" });
    }

    const tableDoc = await Table.findOne({
      _id: table,
      tenantId: req.user.tenantId,
    });
    if (!tableDoc) {
      return res
        .status(400)
        .json({ message: "Invalid table" });
    }

    const menuItems = await MenuItem.find({
      _id: { $in: items.map((i) => i.menuItem) },
      tenantId: req.user.tenantId,
    });

    const itemsWithPrice = items.map((i) => {
      const menu = menuItems.find(
        (m) => m._id.toString() === i.menuItem
      );

      return {
        menuItem: i.menuItem,
        quantity: i.quantity,
        price: menu?.price || 0,
      };
    });

    const total = itemsWithPrice.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      tenantId: req.user.tenantId,
      table,
      items: itemsWithPrice,
      totalAmount: total,
      createdBy: req.user._id,
    });

    // 🔥 STOCK DEDUCT
    await applyStockChange({
      tenantId: req.user.tenantId,
      items: order.items,
      direction: "DEDUCT",
    });

    await Table.findOneAndUpdate(
      { _id: table, tenantId: req.user.tenantId },
      { status: "OCCUPIED" }
    );

    const populatedOrder = await order.populate([
      { path: "table", select: "name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("❌ Order create error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ADD ITEMS TO EXISTING ORDER (STOCK DEDUCT)
===================================================== */
export const addItemsToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ message: "Items required" });
    }

    const order = await Order.findOne({
      _id: orderId,
      tenantId: req.user.tenantId,
    });
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found" });

    const menuItems = await MenuItem.find({
      _id: { $in: items.map((i) => i.menuItem) },
      tenantId: req.user.tenantId,
    });

    for (const item of items) {
      const menu = menuItems.find(
        (m) => m._id.toString() === item.menuItem
      );

      const existing = order.items.find(
        (i) => i.menuItem.toString() === item.menuItem
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        order.items.push({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: menu?.price || 0,
        });
      }

      order.totalAmount += (menu?.price || 0) * item.quantity;
    }

    await order.save();

    // 🔥 STOCK DEDUCT
    await applyStockChange({
      tenantId: req.user.tenantId,
      items,
      direction: "DEDUCT",
    });

    const populatedOrder = await order.populate([
      { path: "table", select: "name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.json(populatedOrder);
  } catch (err) {
    console.error("❌ Add item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   UPDATE ORDER STATUS
===================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found" });

    // 🔥 CANCEL → RESTORE STOCK
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      await applyStockChange({
        tenantId: req.user.tenantId,
        items: order.items,
        direction: "RESTORE",
      });
    }

    order.status = status;
    await order.save();

    if (status === "SERVED" || status === "CANCELLED") {
      await Table.findOneAndUpdate(
        { _id: order.table, tenantId: req.user.tenantId },
        { status: "AVAILABLE" }
      );
    }

    const populatedOrder = await order.populate([
      { path: "table", select: "name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.json(populatedOrder);
  } catch (err) {
    console.error("❌ Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   REMOVE SINGLE ITEM (🔥 RESTORE STOCK)
===================================================== */
export const removeOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      tenantId: req.user.tenantId,
    });
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found" });

    const removedItem = order.items.find(
      (i) => i.menuItem.toString() === itemId
    );

    if (removedItem) {
      await applyStockChange({
        tenantId: req.user.tenantId,
        items: [removedItem],
        direction: "RESTORE",
      });
    }

    order.items = order.items.filter(
      (i) => i.menuItem.toString() !== itemId
    );

    order.totalAmount = order.items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    await order.save();

    const populatedOrder = await order.populate([
      { path: "table", select: "name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.json(populatedOrder);
  } catch (err) {
    console.error("❌ Remove item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   DELETE ORDER (❌ NO HARD DELETE)
===================================================== */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found" });

    return res.status(400).json({
      message: "Use CANCEL order instead of delete",
    });
  } catch (err) {
    console.error("❌ Delete order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
