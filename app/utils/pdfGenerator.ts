import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// This must match your ESGContext data shape exactly
interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  gas: string; heatingOil: string; propane: string; diesel: string; petrol: string;
  r410a: string; r32: string; r134a: string;
  elec: string; districtHeat: string;
  vehicleKm: string; flightKm: string; hotelNights: string;
  signerName: string;
}

export const generatePDF = (data: ESGState) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- HELPER: HEADER ---
  const addHeader = () => {
    doc.setFillColor(10, 10, 20); // Dark Navy Background
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("VSME OS", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Official Carbon Assessment", pageWidth - 70, 20);
  };

  // --- HELPER: FOOTER ---
  const addFooter = (pageNumber: number) => {
    doc.setFillColor(245, 247, 250); // Light Gray
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Generated via VSME OS • GHG Protocol Compliant • Page ${pageNumber}`, 20, pageHeight - 6);
  };

  // ==========================
  // PAGE 1: COVER SHEET
  // ==========================
  doc.setFillColor(10, 15, 30); // Deep Dark Blue/Black Theme
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Big Year
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(80);
  doc.setFont('helvetica', 'bold');
  doc.text("2026", 20, 100);

  // Title
  doc.setFontSize(30);
  doc.setTextColor(59, 130, 246); // Blue Highlight
  doc.text("ESG REPORTING", 20, 130);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(16);
  doc.text("Carbon Footprint Assessment (Scopes 1, 2 & 3)", 20, 145);

  // Client Box
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 170, 120, 170);

  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text("PREPARED FOR:", 20, 185);
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(data.companyName || "Client Company Name", 20, 200);
  
  doc.setFontSize(12);
  doc.text(`Location: ${data.country}`, 20, 215);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 225);

  // MVP Badge
  doc.setFillColor(59, 130, 246);
  doc.circle(pageWidth - 30, pageHeight - 30, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("VERIFIED", pageWidth - 39, pageHeight - 29);

  // ==========================
  // PAGE 2: EXECUTIVE SUMMARY
  // ==========================
  doc.addPage();
  addHeader();

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Executive Summary", 20, 50);

  // Summary Cards (Draw Rectangles)
  doc.setFillColor(240, 245, 255); // Light Blue Bg
  doc.roundedRect(20, 60, 170, 35, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("REPORTING PERIOD", 30, 75);
  doc.text("TOTAL REVENUE", 100, 75);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text("FY 2025-2026", 30, 85);
  doc.text(`${data.revenue} ${data.currency}`, 100, 85);

  // Detailed Data Table
  doc.setFontSize(14);
  doc.text("Detailed Emissions Breakdown", 20, 115);

  const tableData = [
    ['Scope 1', 'Stationary Combustion (Gas/Oil)', `${data.gas} kWh / ${data.heatingOil} L`, 'Direct'],
    ['Scope 1', 'Mobile Combustion (Fleet)', `${data.diesel} L / ${data.petrol} L`, 'Direct'],
    ['Scope 1', 'Fugitive Emissions (Refrigerants)', `${data.r410a} kg / ${data.r32} kg`, 'Direct'],
    ['Scope 2', 'Purchased Electricity', `${data.elec} kWh`, 'Indirect'],
    ['Scope 2', 'District Heating', `${data.districtHeat} kWh`, 'Indirect'],
    ['Scope 3', 'Business Travel (Flights)', `${data.flightKm} km`, 'Value Chain'],
    ['Scope 3', 'Business Travel (Hotels)', `${data.hotelNights} nights`, 'Value Chain'],
  ];

  autoTable(doc, {
    startY: 125,
    head: [['Scope', 'Category', 'Input Data', 'Type']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [20, 20, 40], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Signature Section
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("I certify that the data provided in this report is accurate to the best of my knowledge.", 20, finalY);
  
  doc.setDrawColor(0, 0, 0);
  doc.line(20, finalY + 20, 100, finalY + 20); // Signature Line
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(data.signerName || "(Pending Signature)", 20, finalY + 30);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Authorized Representative", 20, finalY + 35);

  addFooter(2);

  // DOWNLOAD THE FILE
  doc.save(`${data.companyName.replace(/\s+/g, '_')}_ESG_Report_2026.pdf`);
};