import { jsPDF } from 'jspdf';

export const generateInvoice = (order, user) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- Header Section --
    doc.setFontSize(22);
    doc.setTextColor(226, 55, 68); // Primary color
    doc.text("Majestic Royal Food", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Deliciousness Delivered to Your Doorstep", pageWidth / 2, 28, { align: "center" });

    // -- Horizontal Line --
    doc.setDrawColor(200);
    doc.line(15, 35, pageWidth - 15, 35);

    // -- Invoice Details --
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("INVOICE", 15, 45);

    doc.setFontSize(10);
    doc.text(`Invoice No: #INV-${order.id}`, 15, 52);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 15, 58);
    doc.text(`Time: ${new Date(order.created_at).toLocaleTimeString()}`, 15, 64);

    // -- Billing Section --
    doc.setFontSize(12);
    doc.text("Bill To:", 15, 78);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(user.name || "Customer", 15, 84);
    doc.setFont("helvetica", "normal");
    doc.text(`Contact: ${order.contact_no || 'N/A'}`, 15, 90);
    const splitAddress = doc.splitTextToSize(`Address: ${order.address || "N/A"}`, pageWidth - 30);
    doc.text(splitAddress, 15, 96);

    // -- Order Summary Section --
    const summaryY = 110;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, summaryY, pageWidth - 30, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, summaryY + 7);
    doc.text("Amount", pageWidth - 45, summaryY + 7);
    doc.setFont("helvetica", "normal");

    // Display items
    const items = order.item_names ? order.item_names.split(', ') : ["Food Order Content"];
    let currentY = summaryY + 20;

    items.forEach((item, index) => {
        const splitItem = doc.splitTextToSize(item, pageWidth - 80);
        doc.text(splitItem, 20, currentY);
        currentY += (splitItem.length * 6);
    });

    const amountY = summaryY + 20;
    doc.text(`INR ${order.total_amount}`, pageWidth - 45, amountY);

    // -- Totals --
    const totalsY = Math.max(currentY + 10, summaryY + 40);
    doc.setDrawColor(230);
    doc.line(120, totalsY, pageWidth - 15, totalsY);

    doc.setFontSize(11);
    doc.text("Total Amount:", 120, totalsY + 10);
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${order.total_amount}`, pageWidth - 45, totalsY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Payment Method:", 15, totalsY + 10);
    doc.setFont("helvetica", "bold");
    doc.text(order.payment_method || "COD", 45, totalsY + 10);

    // -- Footer --
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Thank you for ordering from Majestic Royal Food!", pageWidth / 2, pageWidth + 30, { align: "center" });
    doc.text("For any queries, please contact support@majesticroyal.com", pageWidth / 2, pageWidth + 36, { align: "center" });

    // -- Save the PDF --
    doc.save(`invoice_${order.id}.pdf`);
};
