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

export class PDFGeneratorV2 {
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

    // Summary data
    const income = data[type].incomes;
    const expenses = data[type].expenses;
    const net = income - expenses;

    // Draw summary without table
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Income:', this.margin, this.currentY);
    this.doc.text(`LKR ${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, this.margin + 40, this.currentY);
    this.currentY += 6;

    this.doc.text('Expenses:', this.margin, this.currentY);
    this.doc.text(`LKR ${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, this.margin + 40, this.currentY);
    this.currentY += 6;

    this.doc.text('Net:', this.margin, this.currentY);
    this.doc.text(`LKR ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, this.margin + 40, this.currentY);
    this.currentY += 15;
  }

  private addExpenseTable(expenses: ExpenseRecord[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Expense Records', this.margin, this.currentY);
    this.currentY += 8;

    if (expenses.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No expense records found.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // Draw headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Date', this.margin, this.currentY);
    this.doc.text('Category', this.margin + 30, this.currentY);
    this.doc.text('Description', this.margin + 80, this.currentY);
    this.doc.text('Amount', this.margin + 150, this.currentY);
    this.currentY += 5;

    // Draw header line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;

    // Draw data
    this.doc.setFont('helvetica', 'normal');
    expenses.forEach(expense => {
      this.doc.text(new Date(expense.date).toLocaleDateString('en-US'), this.margin, this.currentY);
      this.doc.text(expense.category, this.margin + 30, this.currentY);
      this.doc.text(expense.description, this.margin + 80, this.currentY);
      this.doc.text(`LKR ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, this.margin + 150, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addIncomeTable(incomes: IncomeRecord[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Income Records', this.margin, this.currentY);
    this.currentY += 8;

    if (incomes.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No income records found.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // Draw headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Date', this.margin, this.currentY);
    this.doc.text('Category', this.margin + 30, this.currentY);
    this.doc.text('Description', this.margin + 80, this.currentY);
    this.doc.text('Amount', this.margin + 150, this.currentY);
    this.currentY += 5;

    // Draw header line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;

    // Draw data
    this.doc.setFont('helvetica', 'normal');
    incomes.forEach(income => {
      this.doc.text(new Date(income.date).toLocaleDateString('en-US'), this.margin, this.currentY);
      this.doc.text(income.category, this.margin + 30, this.currentY);
      this.doc.text(income.description, this.margin + 80, this.currentY);
      this.doc.text(`LKR ${income.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, this.margin + 150, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
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
    }
    
    if (incomes.length > 0) {
      this.addIncomeTable(incomes);
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
    }
    
    if (incomes.length > 0) {
      this.addIncomeTable(incomes);
    }

    this.addSignatureSection();
  }

  public generateExpenseCategoryReport(
    category: string,
    periodLabel: string,
    expenses: ExpenseRecord[]
  ): void {
    this.addHeader('Expense Category Report', `${category} • ${periodLabel}`);

    // Summary
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Category: ${category}`, this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text(`Records: ${expenses.length}`, this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text(
      `Total: LKR ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      this.margin,
      this.currentY
    );
    this.currentY += 12;

    // Table
    this.addExpenseTable(expenses);

    this.addSignatureSection();
  }

  public download(filename: string): void {
    this.doc.save(filename);
  }
}

// Utility function to export PDF
export const exportToPDFV2 = (
  type: 'monthly' | 'yearly',
  reportData: ReportData,
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[]
): void => {
  try {
    console.log('Generating PDF V2:', { type, reportData, expenses: expenses.length, incomes: incomes.length });
    
    const generator = new PDFGeneratorV2();
    
    if (type === 'monthly') {
      generator.generateMonthlyReport(reportData, expenses, incomes);
    } else {
      generator.generateYearlyReport(reportData, expenses, incomes);
    }
    
    const filename = `${type}-financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Downloading PDF V2:', filename);
    generator.download(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export const exportExpenseCategoryToPDF = (
  category: string,
  period: 'monthly' | 'yearly',
  expenses: ExpenseRecord[]
): void => {
  try {
    const generator = new PDFGeneratorV2();
    const periodLabel =
      period === 'monthly'
        ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : String(new Date().getFullYear());

    generator.generateExpenseCategoryReport(category, periodLabel, expenses);

    const dateStr = new Date().toISOString().split('T')[0];
    const safeCategory = category.replace(/[^a-z0-9\-_]+/gi, '_');
    const filename = `expenses-${safeCategory}-${period}-report-${dateStr}.pdf`;
    generator.download(filename);
  } catch (error) {
    console.error('PDF generation error (category):', error);
    alert('Error generating category PDF. Please try again.');
  }
};

export const exportAllCategoriesToSinglePDF = (
  period: 'monthly' | 'yearly',
  expenses: ExpenseRecord[]
): void => {
  try {
    const generator = new PDFGeneratorV2();
    const periodLabel =
      period === 'monthly'
        ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : String(new Date().getFullYear());

    const categories = Array.from(new Set(expenses.map(e => e.category))).sort();
    if (categories.length === 0) {
      generator.generateExpenseCategoryReport('All Categories', periodLabel, expenses);
    } else {
      categories.forEach((cat, index) => {
        const byCat = expenses.filter(e => e.category === cat);
        if (index > 0) {
          (generator as any).addNewPage?.();
        }
        generator.generateExpenseCategoryReport(cat, periodLabel, byCat);
      });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `expenses-all-categories-${period}-report-${dateStr}.pdf`;
    generator.download(filename);
  } catch (error) {
    console.error('PDF generation error (all categories):', error);
    alert('Error generating all-categories PDF. Please try again.');
  }
};
