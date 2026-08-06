import ExcelJS from 'exceljs';

/**
 * Generates a styled Excel sheet report buffer.
 * @param {Object} user 
 * @param {Array} transactions 
 * @param {Object} summary 
 * @param {String} periodLabel 
 * @returns {Promise<Buffer>}
 */
export const generateExcel = async (user, transactions, summary, periodLabel) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions Report');

  // Title Block
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'FinTrack Financial Report';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFC9A35E' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 35;

  // Metadata information
  worksheet.getCell('A3').value = 'Account Name:';
  worksheet.getCell('B3').value = user.name;
  worksheet.getCell('A4').value = 'Email ID:';
  worksheet.getCell('B4').value = user.email;

  worksheet.getCell('D3').value = 'Statement Period:';
  worksheet.getCell('E3').value = periodLabel;
  worksheet.getCell('D4').value = 'Export Date:';
  worksheet.getCell('E4').value = new Date().toLocaleDateString('en-IN');

  // Styling metadata labels
  ['A3', 'A4', 'D3', 'D4'].forEach((cell) => {
    worksheet.getCell(cell).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF8B8579' } };
  });
  ['B3', 'B4', 'E3', 'E4'].forEach((cell) => {
    worksheet.getCell(cell).font = { name: 'Segoe UI', size: 10, color: { argb: 'FF333333' } };
  });

  // Table Headers
  const headerRow = worksheet.getRow(6);
  headerRow.values = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)'];
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF12160F' }, // Ink/Dark background
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFC9A35E' } },
    };
  });

  // Populate transaction records
  transactions.forEach((tx) => {
    const isIncome = tx.type === 'income';
    const row = worksheet.addRow([
      new Date(tx.date).toLocaleDateString('en-IN'),
      tx.type.toUpperCase(),
      tx.category,
      tx.name,
      isIncome ? tx.amount : -Math.abs(tx.amount), // negative for expenses
    ]);

    row.height = 20;
    
    // Style data cell alignments
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'right' };

    // Format currency and font color
    const amountCell = row.getCell(5);
    amountCell.numFmt = '₹#,##0.00;[Red]-₹#,##0.00;"₹0.00"';
    amountCell.font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: isIncome ? 'FF6FAE8C' : 'FF000000' }, // Green for income
    };
  });

  // Separation space
  worksheet.addRow([]);

  // Summary rows at the bottom
  const borderThin = { style: 'thin', color: { argb: 'FFCCCCCC' } };

  // Total Income
  const totalIncomeRow = worksheet.addRow(['Total Income', '', '', '', summary.totalIncome]);
  totalIncomeRow.getCell(5).numFmt = '₹#,##0.00';
  totalIncomeRow.getCell(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF8B8579' } };
  totalIncomeRow.getCell(5).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF6FAE8C' } };

  // Total Expenses
  const totalExpenseRow = worksheet.addRow(['Total Expenses', '', '', '', -Math.abs(summary.totalExpense)]);
  totalExpenseRow.getCell(5).numFmt = '₹#,##0.00;[Red]-₹#,##0.00;"₹0.00"';
  totalExpenseRow.getCell(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF8B8579' } };
  totalExpenseRow.getCell(5).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFC9A35E' } };

  // Net Balance
  const netSavingsRow = worksheet.addRow(['Net Balance', '', '', '', summary.netBalance]);
  netSavingsRow.getCell(5).numFmt = '₹#,##0.00;[Red]-₹#,##0.00;"₹0.00"';
  netSavingsRow.getCell(1).font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF12160F' } };
  
  const balanceColor = summary.netBalance >= 0 ? 'FF6FAE8C' : 'FFB3552F';
  netSavingsRow.getCell(5).font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: balanceColor } };

  // Add borders to summary cells
  [totalIncomeRow, totalExpenseRow, netSavingsRow].forEach((row) => {
    row.getCell(1).border = { top: borderThin, bottom: borderThin };
    row.getCell(5).border = { top: borderThin, bottom: borderThin };
  });

  // Auto-size Column widths dynamically based on contents
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    // Add extra padding to avoid clipping
    column.width = Math.max(maxLength + 4, 12);
  });

  // Compile to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
