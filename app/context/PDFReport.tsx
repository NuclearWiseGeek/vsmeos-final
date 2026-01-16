/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { ActivityResult, Totals } from '@/utils/calculations';

// --- 1. STYLES DEFINITION ---
// We define styles to match the "Corporate Carbon Pack" reference PDF exactly.
const styles = StyleSheet.create({
  page: { 
      paddingTop: 40, 
      paddingBottom: 60, 
      paddingHorizontal: 40, 
      fontFamily: 'Helvetica', 
      fontSize: 10, 
      color: '#1F2937', // Gray-800
      lineHeight: 1.4 
  },
  
  // Header Branding
  brandTitle: { fontSize: 10, color: '#9CA3AF', marginBottom: 4, letterSpacing: 1 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subTitle: { fontSize: 10, color: '#4B5563', marginBottom: 20 },
  
  // Company Info Grid
  infoBox: { 
      flexDirection: 'column', 
      borderBottomWidth: 1, 
      borderBottomColor: '#E5E7EB', 
      paddingBottom: 20, 
      marginBottom: 20 
  },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 120, fontWeight: 'bold', color: '#374151' },
  infoValue: { flex: 1, color: '#111827' },

  // Section Headers
  sectionHeader: { 
      fontSize: 12, 
      fontWeight: 'bold', 
      marginTop: 15, 
      marginBottom: 10, 
      color: '#111827', 
      textTransform: 'uppercase',
      borderBottomWidth: 2,
      borderBottomColor: '#F3F4F6',
      paddingBottom: 4
  },
  
  // Tables
  tableContainer: { width: '100%', marginTop: 5, marginBottom: 20 },
  tableHeader: { 
      flexDirection: 'row', 
      backgroundColor: '#F9FAFB', 
      paddingVertical: 8, 
      paddingHorizontal: 6,
      borderBottomWidth: 1, 
      borderBottomColor: '#E5E7EB' 
  },
  tableRow: { 
      flexDirection: 'row', 
      paddingVertical: 8, 
      paddingHorizontal: 6,
      borderBottomWidth: 1, 
      borderBottomColor: '#F3F4F6' 
  },
  
  // Column Widths
  colMetric: { width: '60%', fontSize: 9, fontWeight: 'bold', color: '#374151' },
  colValue: { width: '40%', fontSize: 9, textAlign: 'right', color: '#111827' },
  
  colScope: { width: '15%', fontSize: 9 },
  colCat: { width: '25%', fontSize: 9 },
  colAct: { width: '30%', fontSize: 9 },
  colQty: { width: '15%', fontSize: 9, textAlign: 'right' },
  colEmi: { width: '15%', fontSize: 9, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // Footer
  footerContainer: { 
      position: 'absolute', 
      bottom: 30, 
      left: 40, 
      right: 40, 
      borderTopWidth: 1, 
      borderTopColor: '#E5E7EB', 
      paddingTop: 10 
  },
  footerText: { fontSize: 8, color: '#9CA3AF', textAlign: 'center', marginBottom: 2 }
});

// --- 2. HELPER UTILITIES ---

// Format numbers nicely (e.g., 1,234.56)
const fmt = (n: number | undefined) => {
    return n ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";
};

// --- 3. CUSTOM PIE CHART COMPONENT ---
// Since react-pdf doesn't support HTML canvas or external chart libs,
// we must draw the pie chart manually using SVG Paths and trigonometry.
const PieChart = ({ s1, s2, s3 }: { s1: number, s2: number, s3: number }) => {
    const total = s1 + s2 + s3 || 1; // Avoid divide by zero
    
    // Config
    const size = 100;
    const radius = 50;
    const center = 50;
    
    // Calculate proportions
    const p1 = s1 / total;
    const p2 = s2 / total;
    const p3 = s3 / total;
    
    // Helper: Calculate Coordinates for a specific percentage of the circle
    const getCoordinatesForPercent = (percent: number) => {
        const x = center + radius * Math.cos(2 * Math.PI * percent);
        const y = center + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    let cumulativePercent = 0; // State to track where the last slice ended

    // Helper: Generate the SVG Path command for a slice
    const makeSlicePath = (percent: number) => {
        // Start of the arc
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        
        // End of the arc
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        
        // Determine if arc is > 180 degrees (large arc flag)
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        
        // SVG Path Command: Move to center -> Line to start -> Arc to end -> Line to center
        return [
            `M ${center} ${center}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L ${center} ${center}`,
        ].join(' ');
    };

    return (
        <Svg viewBox="0 0 100 100" width={100} height={100}>
            {/* Scope 1 Slice (Blue) */}
            {s1 > 0 && <Path d={makeSlicePath(p1)} fill="#2563EB" />} 
            
            {/* Scope 2 Slice (Orange) */}
            {s2 > 0 && <Path d={makeSlicePath(p2)} fill="#F97316" />} 
            
            {/* Scope 3 Slice (Purple) */}
            {s3 > 0 && <Path d={makeSlicePath(p3)} fill="#A855F7" />}
        </Svg>
    );
};


// --- 4. MAIN PDF COMPONENT ---
interface PDFProps {
    company: any;
    results: ActivityResult[];
    totals: Totals;
    signer: string;
}

export const PDFReport = ({ company, results, totals, signer }: PDFProps) => (
  <Document>
    
    {/* ================= PAGE 1: DATA & SUMMARY ================= */}
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View>
          <Text style={styles.brandTitle}>VSME OS • CORPORATE ESG</Text>
          <Text style={styles.mainTitle}>CARBON FOOTPRINT DECLARATION</Text>
          <Text style={styles.subTitle}>
              Methodology Aligned with GHG Protocol & ISO 14064-1 • Date: {new Date().toLocaleDateString()}
          </Text>
      </View>

      {/* Company Info Block */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Company Name:</Text>
            <Text style={styles.infoValue}>{company.name}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Site Country:</Text>
            <Text style={styles.infoValue}>{company.country}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reporting Period:</Text>
            <Text style={styles.infoValue}>{company.year}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Financial Year:</Text>
            <Text style={styles.infoValue}>{company.financialYear}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Annual Revenue:</Text>
            <Text style={styles.infoValue}>{fmt(company.revenue)} {company.currency}</Text>
        </View>
        <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 9, color: '#6B7280' }}>
                This report covers Scope 1 (Direct), Scope 2 (Energy Indirect), and selected Scope 3 (Business Travel). 
                Calculations use ADEME Base Carbone v23.0 emission factors.
            </Text>
        </View>
      </View>

      {/* Section 1: Emissions Summary (Split Layout) */}
      <Text style={styles.sectionHeader}>1. Emissions Summary</Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
          
          {/* LEFT: Summary Table */}
          <View style={{ flex: 1, marginRight: 20 }}>
              <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                      <Text style={styles.colMetric}>METRIC</Text>
                      <Text style={styles.colValue}>VALUE</Text>
                  </View>
                  
                  {/* Rows */}
                  <View style={styles.tableRow}>
                      <Text style={styles.colMetric}>Scope 1 (Direct Emissions)</Text>
                      <Text style={styles.colValue}>{fmt(totals.scope1)} kgCO2e</Text>
                  </View>
                  <View style={styles.tableRow}>
                      <Text style={styles.colMetric}>Scope 2 (Indirect Energy)</Text>
                      <Text style={styles.colValue}>{fmt(totals.scope2)} kgCO2e</Text>
                  </View>
                  <View style={styles.tableRow}>
                      <Text style={styles.colMetric}>Scope 3 (Business Travel)</Text>
                      <Text style={styles.colValue}>{fmt(totals.scope3)} kgCO2e</Text>
                  </View>
                  
                  {/* Total Row */}
                  <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 0 }]}>
                      <Text style={[styles.colMetric, { fontWeight: 'bold', color: '#000' }]}>TOTAL FOOTPRINT</Text>
                      <Text style={[styles.colValue, { fontWeight: 'bold', color: '#000' }]}>{fmt(totals.total)} kgCO2e</Text>
                  </View>
                  
                  {/* Intensity Row */}
                  <View style={[styles.tableRow, { marginTop: 4, borderBottomWidth: 0 }]}>
                      <Text style={[styles.colMetric, { fontStyle: 'italic', fontWeight: 'normal' }]}>Carbon Intensity</Text>
                      <Text style={[styles.colValue, { fontStyle: 'italic' }]}>
                          {(totals.total / (company.revenue || 1)).toFixed(4)} kgCO2e / {company.currency}
                      </Text>
                  </View>
              </View>
          </View>

          {/* RIGHT: Pie Chart Visualization */}
          <View style={{ width: 120, alignItems: 'center', paddingTop: 10 }}>
              <PieChart s1={totals.scope1} s2={totals.scope2} s3={totals.scope3} />
              
              {/* Legend */}
              <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ width: 8, height: 8, backgroundColor: '#2563EB', marginRight: 4 }} />
                      <Text style={{ fontSize: 8, color: '#666' }}>Scope 1</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ width: 8, height: 8, backgroundColor: '#F97316', marginRight: 4 }} />
                      <Text style={{ fontSize: 8, color: '#666' }}>Scope 2</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, backgroundColor: '#A855F7', marginRight: 4 }} />
                      <Text style={{ fontSize: 8, color: '#666' }}>Scope 3</Text>
                  </View>
              </View>
          </View>
      </View>

      {/* Section 2: Detailed Breakdown */}
      <Text style={styles.sectionHeader}>2. Detailed Breakdown</Text>
      <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
              <Text style={[styles.colScope, { fontWeight: 'bold' }]}>Scope</Text>
              <Text style={[styles.colCat, { fontWeight: 'bold' }]}>Category</Text>
              <Text style={[styles.colAct, { fontWeight: 'bold' }]}>Activity</Text>
              <Text style={[styles.colQty, { fontWeight: 'bold' }]}>Qty</Text>
              <Text style={[styles.colEmi, { fontWeight: 'bold' }]}>Emissions</Text>
          </View>
          {results.map((row, i) => (
              <View key={i} style={styles.tableRow}>
                  <Text style={styles.colScope}>{row.scope}</Text>
                  <Text style={styles.colCat}>{row.category}</Text>
                  <Text style={styles.colAct}>{row.activity}</Text>
                  <Text style={styles.colQty}>{fmt(row.quantity)}</Text>
                  <Text style={styles.colEmi}>{fmt(row.emissions)}</Text>
              </View>
          ))}
      </View>

      {/* Page 1 Footer */}
      <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Generated by VSME Supplier ESG OS • Aligned with GHG Protocol & ISO 14064-1 • ADEME Base Carbone v23.0</Text>
          <Text style={styles.footerText}>Page 1 of 2</Text>
      </View>
    </Page>

    {/* ================= PAGE 2: EVIDENCE & ATTESTATION ================= */}
    <Page size="A4" style={styles.page}>
        
        {/* Section 3: Evidence */}
        <Text style={styles.sectionHeader}>3. Evidence & Assurance</Text>
        <View style={{ marginBottom: 25, paddingHorizontal: 10 }}>
            <Text style={{ marginBottom: 8, fontSize: 10, fontWeight: 'bold' }}>
                Supporting documentation retained by supplier:
            </Text>
            
            {/* Dynamic Checkbox List based on data */}
            <View style={{ marginLeft: 10 }}>
                {totals.scope1 > 0 && <Text style={{ marginBottom: 4 }}>• Fuel Invoices (Gas, Oil, Fleet Receipts)</Text>}
                {totals.scope2 > 0 && <Text style={{ marginBottom: 4 }}>• Utility Invoices (Electricity, District Heat)</Text>}
                {totals.scope3 > 0 && <Text style={{ marginBottom: 4 }}>• Travel Logs / Expense Reports / Flight Tickets</Text>}
                {totals.total === 0 && <Text style={{ marginBottom: 4 }}>• No material emissions reported.</Text>}
            </View>

            <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 15, fontStyle: 'italic' }}>
                (Digital copies of the above evidence are available upon buyer request via the VSME OS Verification Portal. 
                No files are attached directly to this PDF to maintain file size compliance.)
            </Text>
        </View>

        {/* Section 4: Attestation */}
        <Text style={styles.sectionHeader}>4. Attestation</Text>
        <View style={{ border: '1px solid #E5E7EB', padding: 20, marginBottom: 25, borderRadius: 4 }}>
            <Text style={{ marginBottom: 20, lineHeight: 1.6 }}>
                I, <Text style={{ fontWeight: 'bold' }}>{signer}</Text>, hereby certify that the activity data, revenue figures, and reporting boundaries provided in this declaration are accurate to the best of my knowledge and reflect the operational reality of the reporting period stated above.
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                <View>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, marginBottom: 8 }} />
                    <Text style={{ fontSize: 9 }}>Authorized Signature</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 9 }}>Date Signed</Text>
                </View>
            </View>
        </View>

        {/* Section 5: Disclaimer */}
        <Text style={styles.sectionHeader}>5. Disclaimer & Limitations</Text>
        <View style={{ paddingHorizontal: 5 }}>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ width: 10, fontSize: 8 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 8, color: '#4B5563' }}>
                    <Text style={{ fontWeight: 'bold' }}>Methodology:</Text> Calculations utilize supplier-provided activity data and recognized emission factors from ADEME Base Carbone v23.0 (France) and GHG Protocol standard values.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ width: 10, fontSize: 8 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 8, color: '#4B5563' }}>
                    <Text style={{ fontWeight: 'bold' }}>Assurance:</Text> This report is a self-declaration. Unless explicitly stated, it has not undergone third-party verification.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ width: 10, fontSize: 8 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 8, color: '#4B5563' }}>
                    <Text style={{ fontWeight: 'bold' }}>Liability:</Text> VSME OS provides the calculation framework; data accuracy remains the sole responsibility of the reporting entity. Buyers must conduct due diligence for CSRD compliance.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ width: 10, fontSize: 8 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 8, color: '#4B5563' }}>
                    <Text style={{ fontWeight: 'bold' }}>Contact:</Text> For verification inquiries, please contact verify@vsme.io
                </Text>
            </View>
        </View>

        {/* Page 2 Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Generated by VSME Supplier ESG OS • Aligned with GHG Protocol & ISO 14064-1</Text>
          <Text style={styles.footerText}>Page 2 of 2</Text>
        </View>
    </Page>
  </Document>
);