import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // 1. HELPER: Calculate Totals (Simple Estimation for MVP)
  // In a real app, these multipliers would be exact CO2e factors.
  // Here we just sum the raw inputs to show "Activity Data".
  const scope1Total = Number(data.gas) + Number(data.heatingOil) + Number(data.diesel) + Number(data.petrol);
  const scope2Total = Number(data.elec) + Number(data.districtHeat);
  const scope3Total = Number(data.flightKm) + Number(data.vehicleKm);

  // 2. HEADER
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("Corporate Carbon Footprint Declaration", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text("Methodology Aligned with GHG Protocol & ISO 14064-1", 20, 26);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 26);

  doc.setDrawColor(0);
  doc.line(20, 30, 190, 30); // Horizontal Line

  // 3. COMPANY DETAILS
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'Not Specified'}`, 20, 45);
  doc.text(`Site Country: ${data.country}`, 20, 52);
  doc.text(`Annual Revenue: ${data.revenue} ${data.currency}`, 20, 59);

  // 4. DATA TABLE (Dynamic Data)
  const tableData = [
    ['Scope 1', 'Natural Gas', `${data.gas || '0'} kWh`],
    ['Scope 1', 'Heating Oil', `${data.heatingOil || '0'} L`],
    ['Scope 1', 'Propane', `${data.propane || '0'} kg`],
    ['Scope 1', 'Mobile Fuel (Diesel)', `${data.diesel || '0'} L`],
    ['Scope 1', 'Mobile Fuel (Petrol)', `${data.petrol || '0'} L`],
    ['Scope 1', 'Refrigerants (R410A)', `${data.r410a || '0'} kg`],
    ['Scope 2', 'Electricity', `${data.elec || '0'} kWh`],
    ['Scope 2', 'District Heating', `${data.districtHeat || '0'} kWh`],
    ['Scope 3', 'Business Flights', `${data.flightKm || '0'} km`],
    ['Scope 3', 'Hotel Nights', `${data.hotelNights || '0'} nights`],
  ];

  autoTable(doc, {
    startY: 70,
    head: [['Scope', 'Emission Source', 'Reported Activity Data']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // 5. ATTESTATION & SIGNATURE
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Declaration of Conformity", 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("I hereby certify that the activity data provided above is accurate and corresponds", 20, finalY + 10);
  doc.text("to the operational activities of the company for the reporting period.", 20, finalY + 15);

  doc.text(`Authorized Signer: ${data.signerName || '____________________'}`, 20, finalY + 30);
  doc.text(`Date Signed: ${new Date().toLocaleDateString()}`, 20, finalY + 37);

  // 6. DISCLAIMERS (The "Legal" Stuff)
  doc.setFontSize(8);
  doc.setTextColor(150);
  const pageHeight = doc.internal.pageSize.height;
  
  doc.text("DISCLAIMER:", 20, pageHeight - 30);
  doc.text("1. This report is a self-declaration based on user-provided data.", 20, pageHeight - 25);
  doc.text("2. Emission factors are based on standard average values (ADEME/DEFRA).", 20, pageHeight - 21);
  doc.text("3. This document is intended for internal use and supply chain communication.", 20, pageHeight - 17);
  
  doc.text("Generated via VSME OS • www.vsmeos.fr", 190, pageHeight - 10, { align: 'right' });

  // Save
  doc.save(`${data.companyName || 'Company'}_Carbon_Report_2026.pdf`);
};