import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the shape of the data we expect
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
}

export const generateCarbonPack = (data: ESGData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // --- CALCULATIONS ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1,
    diesel: 3.16, petrol: 2.8,
    r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, heat: 0.170,
    vehicle: 0.218, flight: 0.14, hotel: 6.9
  };

  const rows = [];
  
  // Scope 1
  if(data.gas > 0) rows.push(['Scope 1', 'Natural Gas', `${data.gas} kWh`, (data.gas * FACTORS.gas).toFixed(2)]);
  if(data.heatingOil > 0) rows.push(['Scope 1', 'Heating Oil', `${data.heatingOil} L`, (data.heatingOil * FACTORS.heatingOil).toFixed(2)]);
  if(data.propane > 0) rows.push(['Scope 1', 'Propane', `${data.propane} kg`, (data.propane * FACTORS.propane).toFixed(2)]);
  if(data.diesel > 0) rows.push(['Scope 1', 'Fleet Diesel', `${data.diesel} L`, (data.diesel * FACTORS.diesel).toFixed(2)]);
  if(data.petrol > 0) rows.push(['Scope 1', 'Fleet Petrol', `${data.petrol} L`, (data.petrol * FACTORS.petrol).toFixed(2)]);
  if(data.r410a > 0) rows.push(['Scope 1', 'Refrig R410A', `${data.r410a} kg`, (data.r410a * FACTORS.r410a).toFixed(2)]);
  if(data.r32 > 0) rows.push(['Scope 1', 'Refrig R32', `${data.r32} kg`, (data.r32 * FACTORS.r32).toFixed(2)]);
  if(data.r134a > 0) rows.push(['Scope 1', 'Refrig R134a', `${data.r134a} kg`, (data.r134a * FACTORS.r134a).toFixed(2)]);
  
  // Scope 2
  if(data.elec > 0) rows.push(['Scope 2', 'Electricity (FR)', `${data.elec} kWh`, (data.elec * FACTORS.elec).toFixed(2)]);
  if(data.districtHeat > 0) rows.push(['Scope 2', 'District Heating', `${data.districtHeat} kWh`, (data.districtHeat * FACTORS.heat).toFixed(2)]);

  // Scope 3
  if(data.vehicleKm > 0) rows.push(['Scope 3', 'Employee Travel', `${data.vehicleKm} km`, (data.vehicleKm * FACTORS.vehicle).toFixed(2)]);
  if(data.flightKm > 0) rows.push(['Scope 3', 'Business Flights', `${data.flightKm} km`, (data.flightKm * FACTORS.flight).toFixed(2)]);
  if(data.hotelNights > 0) rows.push(['Scope 3', 'Hotel Nights', `${data.hotelNights} nights`, (data.hotelNights * FACTORS.hotel).toFixed(2)]);

  // Totals
  const s1 = (data.gas * FACTORS.gas) + (data.heatingOil * FACTORS.heatingOil) + (data.propane * FACTORS.propane) +
             (data.diesel * FACTORS.diesel) + (data.petrol * FACTORS.petrol) +
             (data.r410a * FACTORS.r410a) + (data.r32 * FACTORS.r32) + (data.r134a * FACTORS.r134a);
             
  const s2 = (data.elec * FACTORS.elec) + (data.districtHeat * FACTORS.heat);
  const s3 = (data.vehicleKm * FACTORS.vehicle) + (data.flightKm * FACTORS.flight) + (data.hotelNights * FACTORS.hotel);
  const total = s1 + s2 + s3;

  // --- PDF GENERATION ---
  doc.setFontSize(18);
  doc.text("CORPORATE CARBON FOOTPRINT DECLARATION", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Methodology Aligned with GHG Protocol & ISO 14064-1", 14, 26);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 31);

  doc.setDrawColor(200);
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 38, pageWidth - 28, 28, 'F');
  
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Company Name: ${data.companyName}`, 20, 46);
  doc.text(`Site Country: ${data.country}`, 20, 52);
  doc.text(`Reporting Period: 2025`, 120, 46);
  doc.text(`Annual Revenue: ${data.revenue} ${data.currency}`, 120, 52);

  doc.setFontSize(9);
  doc.setTextColor(80);
  const boundaryText = "This report covers Scope 1 (Direct), Scope 2 (Energy Indirect), and selected Scope 3 (Business Travel). Calculations use ADEME Base Carbone emission factors.";
  doc.text(doc.splitTextToSize(boundaryText, pageWidth - 28), 14, 75);

  autoTable(doc, {
    startY: 85,
    head: [['METRIC', 'VALUE (kgCO2e)']],
    body: [
      ['Scope 1 (Direct Emissions)', s1.toLocaleString(undefined, {maximumFractionDigits: 2})],
      ['Scope 2 (Indirect Energy)', s2.toLocaleString(undefined, {maximumFractionDigits: 2})],
      ['Scope 3 (Business Travel)', s3.toLocaleString(undefined, {maximumFractionDigits: 2})],
      ['TOTAL FOOTPRINT', total.toLocaleString(undefined, {maximumFractionDigits: 2})],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
  });

  doc.text("Detailed Breakdown:", 14, (doc as any).lastAutoTable.finalY + 10);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Scope', 'Activity', 'Qty', 'Emissions (kg)']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Evidence & Assurance:", 14, finalY);
  
  doc.setFontSize(9);
  doc.setTextColor(60);
  finalY += 6;
  doc.text("Assurance Level: Limited (self-attested, document trail available)", 14, finalY);
  finalY += 5;
  doc.text("Supporting documentation retained by supplier:", 14, finalY);
  
  finalY += 5;
  if(data.gas > 0 || data.heatingOil > 0 || data.propane > 0) { doc.text("- Energy Bills (Gas/Oil/Propane)", 20, finalY); finalY += 4; }
  if(data.elec > 0 || data.districtHeat > 0) { doc.text("- Utility Invoices (Elec/Heat)", 20, finalY); finalY += 4; }
  if(data.diesel > 0 || data.petrol > 0) { doc.text("- Fuel Logs/Receipts", 20, finalY); finalY += 4; }
  if(data.r410a > 0 || data.r32 > 0 || data.r134a > 0) { doc.text("- HVAC Maintenance Logs (Refrigerants)", 20, finalY); finalY += 4; }
  doc.text("- Available upon buyer request", 20, finalY);

  finalY += 15;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text("ATTESTATION:", 14, finalY);
  finalY += 6;
  doc.setFontSize(9);
  doc.text(`I, ${data.signerName}, certify that the activity data and revenue provided are accurate.`, 14, finalY);
  
  finalY += 15;
  doc.line(14, finalY, 80, finalY);
  doc.text("Authorized Signature", 14, finalY + 5);

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Generated by VSME Supplier ESG OS | Aligned with GHG Protocol & ISO 14064-1", 14, pageHeight - 10);
  doc.text("Emission Factors: ADEME Base Carbone v23.0 (France)", 14, pageHeight - 6);

  doc.save("VSME_Carbon_Pack.pdf");
};