import { Debt, ScheduleEntry, PlanSummary, NextMove } from './types';
import { formatCurrency, formatPercentage } from './algos/utils';
import { format, parseISO } from 'date-fns';

// Dynamic imports for client-side only
let jsPDF: any = null;
let Papa: any = null;

// Load dependencies dynamically
const loadDependencies = async () => {
  if (typeof window !== 'undefined') {
    if (!jsPDF) {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default;
      await import('jspdf-autotable');
    }
    if (!Papa) {
      const PapaModule = await import('papaparse');
      Papa = PapaModule.default;
    }
  }
};

export interface ExportData {
  debts: Debt[];
  nextMove: NextMove | null;
  schedule: ScheduleEntry[];
  summary: PlanSummary | null;
}

export async function exportToCSV(data: ExportData): Promise<void> {
  await loadDependencies();
  
  if (!Papa) {
    throw new Error('CSV export not available');
  }

  const csvData = data.schedule.map((entry, index) => {
    const totalBalance = Object.values(entry.remainingBalances).reduce((sum, balance) => sum + balance, 0);
    const totalInterest = Object.values(entry.interestPaid).reduce((sum, interest) => sum + interest, 0);
    
    return {
      'Payment #': index + 1,
      'Date': format(parseISO(entry.paycheckDate), 'MM/dd/yyyy'),
      'Total Payment': entry.total,
      'Interest Paid': totalInterest,
      'Remaining Balance': totalBalance,
      'Payments': entry.allocation.map(a => `Debt ${a.debtId.slice(-4)}: ${formatCurrency(a.amount)}`).join('; ')
    };
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `debt-payoff-plan-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function exportToPDF(data: ExportData): Promise<void> {
  await loadDependencies();
  
  if (!jsPDF) {
    throw new Error('PDF export not available');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Debt Strategist - Payoff Plan', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPosition);
  yPosition += 20;

  // Summary Section
  if (data.summary) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Debt Amount', formatCurrency(data.summary.totalDebtAmount)],
      ['Projected Debt-Free Date', format(new Date(data.summary.projectedDebtFreeDate), 'MMMM yyyy')],
      ['Months to Payoff', data.summary.monthsToPayoff.toString()],
      ['Total Interest Paid', formatCurrency(data.summary.totalInterestPaid)],
      ['Interest Saved vs Minimums', formatCurrency(data.summary.interestSavedVsMinimumsOnly)]
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, margin, yPosition);
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Next Move Section
  if (data.nextMove) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Move', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${format(new Date(data.nextMove.date), 'MMMM dd, yyyy')}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Strategy: ${data.nextMove.rationale}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Action: ${data.nextMove.headline}`, margin, yPosition);
    yPosition += 15;
  }

  // Debts Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Current Debts', margin, yPosition);
  yPosition += 10;

  const debtTableData = data.debts.map(debt => [
    debt.name,
    formatCurrency(debt.balance),
    formatPercentage(debt.apr),
    formatCurrency(debt.minPayment),
    debt.type?.replace('_', ' ').toUpperCase() || 'OTHER'
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Name', 'Balance', 'APR', 'Min Payment', 'Type']],
    body: debtTableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Payment Schedule (first 12 payments)
  if (data.schedule.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Schedule (First 12 Payments)', margin, yPosition);
    yPosition += 10;

    const scheduleData = data.schedule.slice(0, 12).map((entry, index) => {
      const totalBalance = Object.values(entry.remainingBalances).reduce((sum, balance) => sum + balance, 0);
      const totalInterest = Object.values(entry.interestPaid).reduce((sum, interest) => sum + interest, 0);
      
      return [
        (index + 1).toString(),
        format(parseISO(entry.paycheckDate), 'MM/dd/yyyy'),
        formatCurrency(entry.total),
        formatCurrency(totalInterest),
        formatCurrency(totalBalance)
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Date', 'Payment', 'Interest', 'Remaining']],
      body: scheduleData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  // Add disclaimer at the bottom
  const finalY = doc.lastAutoTable?.finalY || yPosition;
  if (finalY > 250) {
    doc.addPage();
    yPosition = margin;
  } else {
    yPosition = finalY + 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const disclaimerText = 'Disclaimer: This tool provides educational guidance and projections based on your inputs. It is not financial advice. Interest calculations are estimates and actual results may vary. Always consult with a qualified financial advisor for personalized advice.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
  doc.text(splitDisclaimer, margin, yPosition);

  // Save the PDF
  doc.save(`debt-payoff-plan-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}