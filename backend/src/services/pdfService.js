import PDFDocument from 'pdfkit';

/**
 * Generates a styled transaction PDF report buffer.
 * @param {Object} user 
 * @param {Array} transactions 
 * @param {Object} summary 
 * @param {String} periodLabel 
 * @returns {Promise<Buffer>}
 */
export const generatePDF = (user, transactions, summary, periodLabel) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', (err) => {
      reject(err);
    });

    // High-Contrast Print-Optimized Palette
    const cGold = '#a37c3f';       // Deep branded gold for accents
    const cStone = '#55524d';      // Dark slate gray for descriptions and metadata labels
    const cDark = '#12130f';       // Deep charcoal/black for primary text
    const cEmerald = '#1b5e20';    // Forest green for incomes
    const cRust = '#b71c1c';       // Crimson red for expenses
    const cLightBg = '#fcfbfa';    // Soft light gray/cream for boxes and zebra lines
    const cBorder = '#e5e3de';     // Soft gray border color
    const cWhite = '#ffffff';

    // 1. Header (Brand Title & Subtitle)
    doc.fillColor(cGold).fontSize(26).font('Helvetica-Bold').text('FinTrack', 50, 45);
    doc.fillColor(cStone).fontSize(10).font('Helvetica').text('Personal Finance Dashboard', 50, 72);
    doc.fillColor(cStone).fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, 400, 50, { align: 'right' });

    // Header Separator line
    doc.strokeColor(cGold).lineWidth(1.5).moveTo(50, 88).lineTo(545, 88).stroke();

    // 2. Metadata Info Block
    doc.moveDown(2);
    doc.fillColor(cDark).fontSize(14).font('Helvetica-Bold').text('Transaction History Statement');
    doc.moveDown(0.5);

    const metaY = doc.y;
    doc.fillColor(cStone).fontSize(9.5).font('Helvetica');
    doc.text(`Account Holder: `, 50, metaY);
    doc.fillColor(cDark).font('Helvetica-Bold').text(user.name, 135, metaY);

    doc.fillColor(cStone).font('Helvetica').text(`Email ID: `, 50, metaY + 14);
    doc.fillColor(cDark).font('Helvetica-Bold').text(user.email, 135, metaY + 14);

    doc.fillColor(cStone).font('Helvetica').text(`Export Period: `, 330, metaY);
    doc.fillColor(cDark).font('Helvetica-Bold').text(periodLabel, 410, metaY);

    doc.fillColor(cStone).font('Helvetica').text(`Status: `, 330, metaY + 14);
    doc.fillColor(cEmerald).font('Helvetica-Bold').text('Fully Audited', 410, metaY + 14);

    // 3. Summary Cards Layout (Light gray boxes with thin borders)
    doc.moveDown(3);
    const startY = doc.y;
    const cardWidth = 145;
    const cardHeight = 55;
    const gap = 17;

    // Card 1: Income
    doc.roundedRect(50, startY, cardWidth, cardHeight, 6).fillColor(cLightBg).fill().strokeColor(cBorder).lineWidth(0.8).stroke();
    doc.fillColor(cStone).fontSize(8).font('Helvetica-Bold').text('TOTAL INCOME', 60, startY + 12);
    doc.fillColor(cEmerald).fontSize(13).text(`+₹${summary.totalIncome.toLocaleString()}`, 60, startY + 28);

    // Card 2: Expenses
    doc.roundedRect(50 + cardWidth + gap, startY, cardWidth, cardHeight, 6).fillColor(cLightBg).fill().strokeColor(cBorder).lineWidth(0.8).stroke();
    doc.fillColor(cStone).fontSize(8).font('Helvetica-Bold').text('TOTAL EXPENSES', 50 + cardWidth + gap + 10, startY + 12);
    doc.fillColor(cRust).fontSize(13).text(`-₹${summary.totalExpense.toLocaleString()}`, 50 + cardWidth + gap + 10, startY + 28);

    // Card 3: Net Balance
    const balanceColor = summary.netBalance >= 0 ? cEmerald : cRust;
    const balanceSign = summary.netBalance >= 0 ? '+' : '-';
    doc.roundedRect(50 + (cardWidth + gap) * 2, startY, cardWidth, cardHeight, 6).fillColor(cLightBg).fill().strokeColor(cBorder).lineWidth(0.8).stroke();
    doc.fillColor(cStone).fontSize(8).font('Helvetica-Bold').text('NET BALANCE', 50 + (cardWidth + gap) * 2 + 10, startY + 12);
    doc.fillColor(balanceColor).fontSize(13).text(`${balanceSign}₹${Math.abs(summary.netBalance).toLocaleString()}`, 50 + (cardWidth + gap) * 2 + 10, startY + 28);

    doc.y = startY + cardHeight + 25;

    // 4. Transactions List Table
    doc.fillColor(cDark).fontSize(12).font('Helvetica-Bold').text('Transactions Ledger');
    doc.moveDown(0.6);

    let tableY = doc.y;

    // Header Dark Banner Row
    doc.rect(50, tableY - 4, 495, 20).fillColor(cDark).fill();

    doc.fillColor(cWhite).fontSize(8.5).font('Helvetica-Bold');
    doc.text('Date', 55, tableY);
    doc.text('Type', 130, tableY);
    doc.text('Category', 200, tableY);
    doc.text('Description', 280, tableY);
    doc.text('Amount', 460, tableY, { align: 'right', width: 80 });

    let currentY = tableY + 22;

    // 5. Table Rows with Zebra Striping
    doc.font('Helvetica').fontSize(8.5);
    transactions.forEach((tx, idx) => {
      // Handle page overflow (margins: top 50, bottom 50)
      if (currentY > 740) {
        doc.addPage();
        tableY = 50;
        // Draw Header Dark Banner Row again on new page
        doc.rect(50, tableY - 4, 495, 20).fillColor(cDark).fill();
        
        doc.fillColor(cWhite).fontSize(8.5).font('Helvetica-Bold');
        doc.text('Date', 55, tableY);
        doc.text('Type', 130, tableY);
        doc.text('Category', 200, tableY);
        doc.text('Description', 280, tableY);
        doc.text('Amount', 460, tableY, { align: 'right', width: 80 });
        currentY = tableY + 22;
        doc.font('Helvetica').fontSize(8.5);
      }

      // Zebra striping background rectangle
      if (idx % 2 === 1) {
        doc.rect(50, currentY - 4, 495, 17).fillColor(cLightBg).fill();
      }

      const isIncome = tx.type === 'income';
      const amountSign = isIncome ? '+' : '-';
      const dateLabel = new Date(tx.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      doc.fillColor(cDark).text(dateLabel, 55, currentY);
      doc.text(tx.type.toUpperCase(), 130, currentY);
      doc.text(tx.category, 200, currentY);
      doc.text(tx.name, 280, currentY, { width: 170, ellipsis: true });
      doc.fillColor(isIncome ? cEmerald : cRust)
        .font('Helvetica-Bold')
        .text(`${amountSign}₹${Math.abs(tx.amount).toLocaleString()}`, 460, currentY, { align: 'right', width: 80 })
        .font('Helvetica');

      currentY += 17;
    });

    // 6. Summary Footer Block
    if (currentY > 740) {
      doc.addPage();
      currentY = 50;
    }

    doc.strokeColor(cBorder).lineWidth(0.8).moveTo(50, currentY).lineTo(545, currentY).stroke();
    currentY += 8;

    doc.fillColor(cStone).fontSize(8.5).font('Helvetica-Bold');
    doc.text('Summary:', 55, currentY);
    doc.fillColor(cDark).text(`Incomes: ₹${summary.totalIncome.toLocaleString()}`, 130, currentY);
    doc.text(`Expenses: ₹${summary.totalExpense.toLocaleString()}`, 270, currentY);
    doc.fillColor(balanceColor).text(`Remaining: ₹${summary.netBalance.toLocaleString()}`, 440, currentY, { align: 'right', width: 100 });

    doc.end();
  });
};
