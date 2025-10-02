import jsPDF from 'jspdf';

interface ExpenseRecord {
  date: string;
  category: string;
  description: string;
  amount: number;
  documentPath?: string;
}

interface IncomeRecord {
  date: string;
  category: string;
  description: string;
  amount: number;
  documentPath?: string;
}

interface ReportData {
  monthly: { expenses: number; incomes: number };
  yearly: { expenses: number; incomes: number };
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 0;
  private margin: number = 20;
  private pageWidth: number = 0;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = this.margin;
  }

  private addHeader(title: string, subtitle?: string) {
    // Company header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Smart Waste - Financial Management', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Report title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 8;
    }

    // Date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(`Generated on: ${currentDate}`, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    this.currentY += 15;

    // Line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSummarySection(data: ReportData, type: 'monthly' | 'yearly') {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Summary`, this.margin, this.currentY);
    this.currentY += 8;

    // Summary table
    const summaryData = [
      ['Income', `LKR ${data[type].incomes.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Expenses', `LKR ${data[type].expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Net', `LKR ${(data[type].incomes - data[type].expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]
    ];

    this.addTable(summaryData, ['Category', 'Amount'], [80, 60]);
    this.currentY += 15;
  }

  private addTable(data: string[][], headers: string[], columnWidths: number[]) {
    const rowHeight = 8;
    const headerHeight = 10;

    // Check if we need a new page
    const totalRows = data.length + 1; // +1 for header
    const tableHeight = totalRows * rowHeight + headerHeight;
    if (this.currentY + tableHeight > this.pageHeight - 40) {
      this.addNewPage();
    }

    // Draw table headers with simple styling
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    let currentX = this.margin;
    headers.forEach((header, index) => {
      this.doc.text(header, currentX + 3, this.currentY + 6);
      currentX += columnWidths[index];
    });

    // Draw header underline
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY + 8, this.margin + columnWidths.reduce((a, b) => a + b, 0), this.currentY + 8);

    this.currentY += headerHeight;

    // Draw table data
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    
    data.forEach((row, rowIndex) => {
      currentX = this.margin;
      row.forEach((cell, cellIndex) => {
        this.doc.text(cell, currentX + 3, this.currentY + 5);
        currentX += columnWidths[cellIndex];
      });
      this.currentY += rowHeight;
    });

    this.currentY += 5;
  }

  private addExpenseTable(expenses: ExpenseRecord[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Expense Records', this.margin, this.currentY);
    this.currentY += 8;

    const tableData = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString('en-US'),
      expense.category,
      expense.description,
      `LKR ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ]);

    this.addTable(tableData, ['Date', 'Category', 'Description', 'Amount'], [30, 35, 60, 35]);
  }

  private addIncomeTable(incomes: IncomeRecord[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Income Records', this.margin, this.currentY);
    this.currentY += 8;

    const tableData = incomes.map(income => [
      new Date(income.date).toLocaleDateString('en-US'),
      income.category,
      income.description,
      `LKR ${income.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ]);

    this.addTable(tableData, ['Date', 'Category', 'Description', 'Amount'], [30, 35, 60, 35]);
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private addSignatureSection() {
    // Move to bottom of page
    this.currentY = this.pageHeight - 60;

    // Line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Signature section
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Left side - Prepared by
    this.doc.text('Prepared by:', this.margin, this.currentY);
    this.currentY += 15;
    this.doc.line(this.margin, this.currentY, this.margin + 60, this.currentY);
    this.doc.text('Financial Officer', this.margin, this.currentY + 5);
    this.currentY -= 15;

    // Right side - Approved by
    this.doc.text('Approved by:', this.pageWidth - this.margin - 60, this.currentY);
    this.currentY += 15;
    this.doc.line(this.pageWidth - this.margin - 60, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.doc.text('Manager', this.pageWidth - this.margin - 60, this.currentY + 5);
  }

  public generateMonthlyReport(
    reportData: ReportData,
    expenses: ExpenseRecord[],
    incomes: IncomeRecord[]
  ): void {
    this.addHeader('Monthly Financial Report', `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    this.addSummarySection(reportData, 'monthly');
    
    if (expenses.length > 0) {
      this.addExpenseTable(expenses);
      this.currentY += 10;
    }
    
    if (incomes.length > 0) {
      this.addIncomeTable(incomes);
      this.currentY += 10;
    }

    this.addSignatureSection();
  }

  public generateYearlyReport(
    reportData: ReportData,
    expenses: ExpenseRecord[],
    incomes: IncomeRecord[]
  ): void {
    this.addHeader('Yearly Financial Report', `${new Date().getFullYear()}`);
    this.addSummarySection(reportData, 'yearly');
    
    if (expenses.length > 0) {
      this.addExpenseTable(expenses);
      this.currentY += 10;
    }
    
    if (incomes.length > 0) {
      this.addIncomeTable(incomes);
      this.currentY += 10;
    }

    this.addSignatureSection();
  }

  public download(filename: string): void {
    this.doc.save(filename);
  }
}

// Utility function to export PDF
export const exportToPDF = (
  type: 'monthly' | 'yearly',
  reportData: ReportData,
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[]
): void => {
  try {
    console.log('Generating PDF:', { type, reportData, expenses: expenses.length, incomes: incomes.length });
    
    const generator = new PDFGenerator();
    
    if (type === 'monthly') {
      generator.generateMonthlyReport(reportData, expenses, incomes);
    } else {
      generator.generateYearlyReport(reportData, expenses, incomes);
    }
    
    const filename = `${type}-financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Downloading PDF:', filename);
    generator.download(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
  }
};
