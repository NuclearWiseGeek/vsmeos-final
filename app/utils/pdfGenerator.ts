import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ESGData {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  gas: number;
  heatingOil: number;
  propane: number;
  diesel: number;
  petrol: number;
  r410a: number;
  r32: number;
  r134a: number;
  elec: number;
  districtHeat: number;
  vehicleKm: number;
  flightKm: number;
  hotelNights: number;
  signerName: string;
  files: string[];
}

export const generateCarbonPack = (data: ESGData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // --- CALCULATIONS ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1,
    diesel: 3.16, petrol: 2.8,
    r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, districtHeat: 0.170,
    vehicleKm: 0.218, flightKm: 0.14, hotelNights: 6.9
  };

  // Scope Totals
  const s1 = (data.gas * FACTORS.gas) + (data.heatingOil * FACTORS.heatingOil) + (data.propane * FACTORS.propane) +
             (data.diesel * FACTORS.diesel) + (data.petrol * FACTORS.petrol) +
             (data.r410a * FACTORS.r410a) + (data.r32 * FACTORS.r32) + (data.r134a * FACTORS.r134a);
  const s2 = (data.elec * FACTORS.elec) + (data.districtHeat * FACTORS.districtHeat);
  const s3 = (data.vehicleKm * FACTORS.vehicleKm) + (data.flightKm * FACTORS.flightKm) + (data.hotelNights * FACTORS.hotelNights);
  const total = s1 + s2 + s3;
  const revenueNum = parseFloat(data.revenue) || 0;
  const intensity = revenueNum > 0 ? (total / revenueNum).toFixed(2) : "0.00";

  // --- PDF GENERATION ---
  
  // 1. Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CORPORATE CARBON FOOTPRINT DECLARATION", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Methodology Aligned with GHG Protocol & ISO 14064-1", 14, 26);
  
  // Date Format: DD MMM YYYY
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Date: ${dateStr}`, 14, 31);

  // 2. Company Details
  doc.setDrawColor(200);
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 38, pageWidth - 28, 28, 'F');
  
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Company Name: ${data.companyName}`, 20, 46);
  doc.text(`Site Country: ${data.country}`, 20, 52);
  doc.text(`Reporting Period: 2025`, 120, 46);
  // Revenue Format
  const formattedRevenue = parseFloat(data.revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  doc.text(`Annual Revenue: ${formattedRevenue} ${data.currency}`, 120, 52);

  // 3. Boundary Statement
  doc.setFontSize(9);
  doc.setTextColor(80);
  const boundaryText = "This report covers Scope 1 (Direct), Scope 2 (Energy Indirect), and selected Scope 3 (Business Travel). Calculations use ADEME Base Carbone emission factors.";
  doc.text(doc.splitTextToSize(boundaryText, pageWidth - 28), 14, 75);

  // 4. Emissions Summary Table (Blue Header)
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold italic");
  doc.text("EMISSIONS SUMMARY", 14, 88);

  autoTable(doc, {
    startY: 92,
    head: [['METRIC', 'VALUE']],
    body: [
      ['Scope 1 (Direct Emissions)', `${s1.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kgCO2e`],
      ['Scope 2 (Indirect Energy)', `${s2.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kgCO2e`],
      ['Scope 3 (Business Travel)', `${s3.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kgCO2e`],
      ['TOTAL FOOTPRINT', `${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kgCO2e`],
      ['CARBON INTENSITY', `${intensity} kgCO2e / ${data.currency}`]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 0, 128], // Dark Blue Header
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'right', fontStyle: 'bold' }
    },
    styles: { fontSize: 10, cellPadding: 3 },
    // Custom styling for Total Row (Row 3)
    didParseCell: function(data) {
      if (data.row.index === 3) {
        data.cell.styles.fillColor = [0, 0, 128];
        data.cell.styles.textColor = 255;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.row.index === 4) {
        data.cell.styles.fontStyle = 'italic';
      }
    }
  });

  // 5. Disclaimer & Dynamic Exclusions
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DISCLAIMER & LIMITATIONS:", 14, finalY);
  
  finalY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("• Methodology: Calculations use supplier-provided activity data and ADEME Base Carbone v23.0 emission factors.", 14, finalY);
  finalY += 5;
  doc.text("• Assurance: This report is self-declared and has not been independently verified.", 14, finalY);
  
  finalY += 5;
  doc.text("• Boundary Exclusions: The following sources were assessed but excluded due to zero reported activity:", 14, finalY);
  
  // Dynamic List logic
  finalY += 5;
  const startExclY = finalY;
  if(data.heatingOil === 0) { doc.text("• Heating Oil", 20, finalY); finalY += 4; }
  if(data.propane === 0) { doc.text("• Propane", 20, finalY); finalY += 4; }
  if(data.petrol === 0) { doc.text("• Fleet Petrol", 20, finalY); finalY += 4; }
  if(data.r410a === 0 && data.r32 === 0 && data.r134a === 0) { doc.text("• Fugitive Emissions (Refrigerants)", 20, finalY); finalY += 4; }
  if(data.elec === 0) { doc.text("• Electricity", 20, finalY); finalY += 4; }
  if(data.districtHeat === 0) { doc.text("• District Heating", 20, finalY); finalY += 4; }
  if(data.flightKm === 0) { doc.text("• Business Flights", 20, finalY); finalY += 4; }
  if(data.hotelNights === 0) { doc.text("• Hotel Nights", 20, finalY); finalY += 4; }
  
  if (finalY === startExclY) {
    doc.text("• None (All categories reported)", 20, finalY);
    finalY += 4;
  }

  doc.text("• Liability: Buyers must conduct due diligence for CSRD reporting compliance.", 14, finalY);
  finalY += 5;
  doc.text("• Verification: For third-party verification inquiries, contact contact@vsmeos.fr", 14, finalY);

  // 6. Evidence
  finalY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Supporting documentation retained by supplier:", 14, finalY);
  finalY += 5;
  doc.setFont("helvetica", "normal");
  
  // Dynamic Evidence Logic
  if(data.gas > 0) { doc.text("• Natural Gas Invoices", 20, finalY); finalY += 4; }
  if(data.heatingOil > 0 || data.propane > 0) { doc.text("• Fuel Purchase Receipts (Heating)", 20, finalY); finalY += 4; }
  if(data.diesel > 0 || data.petrol > 0) { doc.text("• Fuel Logs/Receipts (Vehicle Fleet)", 20, finalY); finalY += 4; }
  if(data.elec > 0 || data.districtHeat > 0) { doc.text("• Utility Invoices", 20, finalY); finalY += 4; }
  if(data.vehicleKm > 0 || data.flightKm > 0) { doc.text("• Mileage Claims / Travel Logs", 20, finalY); finalY += 4; }
  
  // Fixed line requested by user
  doc.text("Available upon buyer request (No digital files attached)", 14, finalY);


  // 7. Attestation (Bold Name)
  finalY += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ATTESTATION:", 14, finalY);
  finalY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  doc.text("I, ", 14, finalY);
  doc.setFont("helvetica", "bold");
  doc.text(data.signerName, 18, finalY); // Offset slightly to fit "I, "
  doc.setFont("helvetica", "normal");
  const nameWidth = doc.getTextWidth(data.signerName);
  doc.text(", certify that the activity data and revenue provided are accurate.", 18 + nameWidth, finalY);
  
  finalY += 15;
  doc.line(14, finalY, 80, finalY);
  doc.text("Authorized Signature", 14, finalY + 5);

  // 8. Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100);
  
  const footerLines = [
    "Generated by VSME Supplier ESG OS",
    "Aligned with GHG Protocol & ISO 14064-1 quantification methodologies.",
    "Supports CSRD ESRS E1 quantitative reporting requirements.",
    "Emission Factors: ADEME Base Carbone v23.0 (France)"
  ];
  
  let footerY = pageHeight - 20;
  footerLines.forEach(line => {
    doc.text(line, pageWidth / 2, footerY, { align: 'center' });
    footerY += 4;
  });

  doc.save("VSME_Carbon_Pack.pdf");
};