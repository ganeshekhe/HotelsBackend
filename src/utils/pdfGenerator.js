
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateBillPDF = ({ bill, order, table }) => {
  const dir = "uploads/bills";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `bill_${bill._id}.pdf`);

  const doc = new PDFDocument({
    size: [300, 720],
    margins: { top: 16, bottom: 14, left: 14, right: 14 },
  });

  doc.pipe(fs.createWriteStream(filePath));

  /* ================= HEADER ================= */
  doc.rect(0, 0, 300, 88).fill("#991B1B");

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("RANGOLI GARDAN", 0, 24, { align: "center" });

  doc
    .fontSize(9)
    .font("Helvetica")
    .text("HOTEL & FAMILY RESTAURANT", { align: "center" })
    .text("Pure Veg | Party Hall Available", { align: "center" });

  doc.moveDown(4);
  doc.fillColor("#111");

  /* ================= BILL INFO ================= */
  const metaY = doc.y;

  doc.roundedRect(14, metaY, 272, 72, 6).fill("#FEF3C7");

  doc.fillColor("#111").fontSize(10);
  doc.text(`Bill No : ${bill._id.toString().slice(-6)}`, 24, metaY + 10);
  doc.text(`Table   : ${table?.name || "-"}`, 24, metaY + 28);
  doc.text(
    `Date    : ${new Date(bill.createdAt).toLocaleString()}`,
    24,
    metaY + 46
  );

  doc.y = metaY + 84;

  /* ================= ITEMS HEADER ================= */
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#991B1B");

  doc.text("ITEM", 14, doc.y, { width: 150, continued: true });
  doc.text("QTY", 170, doc.y, { width: 30, align: "center", continued: true });
  doc.text("AMOUNT", 210, doc.y, { width: 70, align: "right" });

  doc.moveDown(0.2);
  doc.moveTo(14, doc.y).lineTo(286, doc.y).strokeColor("#991B1B").stroke();

  /* ================= ITEMS ================= */
  doc.font("Helvetica").fontSize(10).fillColor("#111");

  order.items.forEach((i) => {
    const amt = i.menuItem.price * i.quantity;
    const y = doc.y;

    doc.text(i.menuItem.name, 14, y, { width: 150 });
    doc.text(i.quantity.toString(), 170, y, { width: 30, align: "center" });
    doc.text(`₹${amt}`, 210, y, { width: 70, align: "right" });

    doc.moveDown(0.4);
  });

  doc.moveDown(0.2);
  doc.moveTo(14, doc.y).lineTo(286, doc.y).strokeColor("#E5E7EB").stroke();

  /* ================= TOTALS ================= */
  doc.moveDown(0.4);

  const row = (label, value, bold = false) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 12 : 10)
      .fillColor(bold ? "#991B1B" : "#111")
      .text(label, 14, doc.y, { continued: true });

    doc.text(`₹${value}`, 210, doc.y, {
      width: 70,
      align: "right",
    });
  };

  row("Sub Total", bill.totalAmount);
  row("GST (5%)", bill.gstAmount);
  row("Discount", bill.discount);

  doc.moveDown(0.3);
  row("GRAND TOTAL", bill.grandTotal, true);

  doc.moveDown(0.3);
  doc.moveTo(14, doc.y).lineTo(286, doc.y).strokeColor("#991B1B").stroke();

  /* ================= PAYMENT ================= */
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#111");
  doc.text(`Paid Amount : ₹${bill.paidAmount}`);
  doc.text(`Payment Mode : ${bill.paymentMode}`);

  /* ================= FOOTER ================= */
  doc.moveDown(0.8);
  const fy = doc.y;

  doc.roundedRect(14, fy, 272, 54, 6).fill("#991B1B");

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("THANK YOU! VISIT AGAIN", 14, fy + 14, {
      width: 272,
      align: "center",
    });

  doc
    .fontSize(9)
    .font("Helvetica")
    .text("RANGOLI GARDAN HOTEL", {
      width: 272,
      align: "center",
    });

  doc.end();
  return filePath;
};
