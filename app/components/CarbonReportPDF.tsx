/* components/CarbonReportPDF.tsx */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

/**
 * PREMIUM HIGH-DENSITY ARCHITECTURAL STYLING
 * Optimized for a strict 3-page A4 output to prevent data density fatigue.
 * Line heights and margins are tightened for a "pitch-perfect" elite look.
 */
const styles = StyleSheet.create({
  page: { 
    paddingTop: 40, 
    paddingBottom: 80, 
    paddingHorizontal: 50, 
    fontSize: 8.5, 
    fontFamily: 'Helvetica', 
    color: '#1a1a1a', 
    lineHeight: 1.25, 
    position: 'relative',
    backgroundColor: '#FFFFFF'
  },
  
  // --- HEADER ARCHITECTURE ---
  header: { 
    marginBottom: 35, // INCREASED SPACE: Fixed the "suffocating" gap
    borderBottomWidth: 0.8, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#F3F4F6', 
    paddingBottom: 15 
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000000', 
    textTransform: 'uppercase', 
    letterSpacing: -0.5,
    textAlign: 'left'
  },
  reportMeta: { 
    fontSize: 7.5, 
    color: '#9CA3AF', 
    marginTop: 12 // Slight increase for better vertical rhythm
  },

  // --- CONTENT SECTIONING ---
  section: { 
    marginTop: 18, 
    marginBottom: 4 
  },
  sectionHeader: { 
    fontSize: 9.5, 
    fontWeight: 'bold', 
    color: '#111827', 
    textTransform: 'uppercase', 
    letterSpacing: 0.6, 
    marginBottom: 6, 
    borderLeftWidth: 2, 
    borderLeftStyle: 'solid', 
    borderLeftColor: '#000080', 
    paddingLeft: 8 
  },
  bodyText: { 
    marginBottom: 5, 
    color: '#374151',
    textAlign: 'justify' 
  },
  
  // COMPLIANCE BLOCK: Centralized under Boundary Statement
  complianceBlock: {
    marginTop: 8,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 1.5,
    borderLeftColor: '#000080',
    fontSize: 7.8,
    color: '#4B5563',
    lineHeight: 1.4
  },
  bold: { 
    fontWeight: 'bold', 
    color: '#111827' 
  },

  // --- PROFILE CARD (APPLE-STYLE COMPACT) ---
  profileContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 15, 
    backgroundColor: '#FAFAFA', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 0.8, 
    borderStyle: 'solid', 
    borderColor: '#F3F4F6' 
  },
  profileItem: { 
    width: '50%', 
    marginBottom: 6 
  },
  profileLabel: { 
    fontSize: 6.5, 
    color: '#9CA3AF', 
    textTransform: 'uppercase', 
    marginBottom: 1, 
    letterSpacing: 0.3 
  },
  profileValue: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    color: '#111827' 
  },

  // --- COMPACT EMISSIONS DATA TABLES ---
  table: { 
    width: '100%', 
    marginTop: 2 
  },
  tableRow: { 
    flexDirection: 'row', 
    minHeight: 22, 
    alignItems: 'center', 
    borderBottomWidth: 0.5, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#F3F4F6' 
  },
  tableHeader: { 
    backgroundColor: '#000080', 
    color: '#FFFFFF', 
    borderRadius: 2,
    minHeight: 24
  },
  tableCell: { 
    paddingHorizontal: 8, 
    flex: 1 
  },
  
  // Table Modifiers
  summaryTotal: { 
    backgroundColor: '#000080', 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    minHeight: 26, 
    marginTop: 2 
  },
  intensityRow: { 
    backgroundColor: '#F0F7FF', 
    color: '#1E40AF',
    borderBottomWidth: 0
  },

  // --- LEGAL COMPONENTS (PAGE 3) ---
  legalContainer: { 
    padding: 12, 
    borderWidth: 0.8, 
    borderStyle: 'solid', 
    borderColor: '#F3F4F6', 
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 10
  },
  bulletList: { 
    marginTop: 4, 
    marginLeft: 2 
  },
  bulletRow: { 
    marginBottom: 4, 
    fontSize: 8, 
    color: '#374151', 
    flexDirection: 'row' 
  },
  bulletPoint: { 
    width: 12, 
    color: '#9CA3AF',
    fontWeight: 'bold'
  },
  signatureWrapper: { 
    marginTop: 35, 
    width: 220, 
    borderTopWidth: 1.2, 
    borderTopStyle: 'solid', 
    borderTopColor: '#000000', 
    paddingTop: 6 
  },

  // --- CLEAN 2-LINE FOOTER PER REQUEST ---
  footerFixedContainer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 50, 
    right: 50, 
    borderTopWidth: 0.8, 
    borderTopStyle: 'solid', 
    borderTopColor: '#F3F4F6', 
    paddingTop: 10 
  },
  footerRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    width: '100%' 
  },
  footerCenterBox: { 
    flex: 1, 
    textAlign: 'center', 
    marginLeft: 40 
  },
  footerRightBox: { 
    width: 40, 
    textAlign: 'right' 
  },
  footerText: { 
    fontSize: 6.5, 
    color: '#9CA3AF', 
    marginBottom: 1,
    letterSpacing: 0.1
  }
});

// --- REPORT ENGINE START ---
export default function CarbonReportPDF({ company, totals, breakdown, activityData }: any) {
  
  // Precision Formatting Helpers
  const fmtNum = (val: any) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const st = (val: any) => val ? String(val) : "-";
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const footprintIntensity = (parseFloat(totals?.total) / (parseFloat(company?.revenue) || 1)) || 0;

  // --- THE 13 FIELDS MASTER LOGIC MAP ---
  const ALL_FIELDS = [
    { key: "natural_gas", label: "Natural Gas", evidence: "Natural Gas Invoices", exclusion: "Natural Gas" },
    { key: "heating_oil", label: "Heating Oil", evidence: "Heating Oil Purchase Receipts", exclusion: "Heating Oil" },
    { key: "propane", label: "Propane", evidence: "Propane Purchase Receipts", exclusion: "Propane" },
    { key: "diesel", label: "Fleet Diesel", evidence: "Fuel Logs/Receipts (Diesel)", exclusion: "Fleet Diesel" },
    { key: "petrol", label: "Fleet Petrol", evidence: "Fuel Logs/Receipts (Petrol)", exclusion: "Fleet Petrol" },
    { key: "ref_R410A", label: "Refrigerants (R410A)", evidence: "HVAC Maintenance Logs", exclusion: "Fugitive Emissions (R410A)" },
    { key: "ref_R32", label: "Refrigerants (R32)", evidence: "HVAC Maintenance Logs", exclusion: "Fugitive Emissions (R32)" },
    { key: "ref_R134a", label: "Refrigerants (R134a)", evidence: "HVAC Maintenance Logs", exclusion: "Fugitive Emissions (R134a)" },
    { key: "electricity_fr", label: "Electricity (FR)", evidence: "Electricity Utility Invoices", exclusion: "Electricity" },
    { key: "district_heat", label: "District Heating", evidence: "District Heating Invoices", exclusion: "District Heating" },
    { key: "grey_fleet_avg", label: "Employee Vehicles", evidence: "Mileage Claims / Travel Logs", exclusion: "Employee Vehicles (Grey Fleet)" },
    { key: "flight_avg", label: "Business Flights", evidence: "Flight Agency Reports", exclusion: "Business Flights" },
    { key: "hotel_night_avg", label: "Hotel Nights", evidence: "Hotel Expense Reports", exclusion: "Hotel Nights" }
  ];

  // Logic: Only show evidence labels if activity > 0
  const activeEvidence: string[] = [];
  const addedEvidenceTypes = new Set<string>();
  
  ALL_FIELDS.forEach(field => {
    const val = parseFloat(activityData?.[field.key]);
    if (val > 0 && !addedEvidenceTypes.has(field.evidence)) {
      activeEvidence.push(field.evidence);
      addedEvidenceTypes.add(field.evidence);
    }
  });

  // Logic: Show all 13 fields as exclusions if activity is 0
  const activeExclusions: string[] = [];
  ALL_FIELDS.forEach(field => {
    const val = parseFloat(activityData?.[field.key]);
    if (!activityData?.[field.key] || val === 0) {
      activeExclusions.push(field.exclusion);
    }
  });

  // CLEAN 2-LINE FOOTER PER REQUEST
  const SharedFooter = () => (
    <View style={styles.footerFixedContainer} fixed>
      <View style={styles.footerRow}>
        <View style={styles.footerCenterBox}>
          <Text style={styles.footerText}>Generated by VSME Supplier ESG OS</Text>
          <Text style={styles.footerText}>Calculations use : ADEME Base Carbone v23.0 emission factors.</Text>
        </View>
        <View style={styles.footerRightBox}>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      {/* --- PAGE 1: CORE DATA & EMISSIONS SUMMARY --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Corporate Carbon Footprint Declaration</Text>
          <Text style={styles.reportMeta}>Report Generation Date: {dateStr}</Text>
        </View>

        {/* 1.1 Company Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.profileItem}><Text style={styles.profileLabel}>Legal Entity</Text><Text style={styles.profileValue}>{st(company?.name)}</Text></View>
          <View style={styles.profileItem}><Text style={styles.profileLabel}>Reporting Period</Text><Text style={styles.profileValue}>{st(company?.year)}</Text></View>
          <View style={styles.profileItem}><Text style={styles.profileLabel}>Site Geography</Text><Text style={styles.profileValue}>{st(company?.country)}</Text></View>
          <View style={styles.profileItem}><Text style={styles.profileLabel}>Financial Revenue</Text><Text style={styles.profileValue}>{fmtNum(company?.revenue)} {st(company?.currency)}</Text></View>
        </View>

        {/* 1.2 Boundary Statement & Compliance Block */}
        <View style={styles.section}>
          <Text style={styles.bodyText}>
            This report covers <Text style={styles.bold}>Scope 1</Text> (Direct), <Text style={styles.bold}>Scope 2</Text> (Energy Indirect), and selected <Text style={styles.bold}>Scope 3</Text> (Business Travel). 
            Calculations use <Text style={styles.bold}>ADEME Base Carbone v23.0</Text> emission factors.
          </Text>
          
          {/* CENTRALIZED COMPLIANCE STATEMENTS MOVED FROM HEADER/FOOTER PER REQUEST */}
          <View style={styles.complianceBlock}>
            <Text style={styles.bold}>Reporting Standards & Compliance:</Text>
            <Text>• Aligned with GHG Protocol & ISO 14064-1 quantification methodologies.</Text>
            <Text>• Supports CSRD ESRS E1 quantitative reporting requirements.</Text>
            <Text>• Emission Factors: ADEME Base Carbone v23.0 (France)</Text>
          </View>
        </View>

        {/* 1.3 Emissions Summary Table */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Emissions Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: '#F9FAFB' }]}>
              <Text style={[styles.tableCell, styles.bold]}>Metric Category</Text>
              <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>Value (kgCO2e)</Text>
            </View>
            <View style={styles.tableRow}><Text style={styles.tableCell}>Scope 1 (Direct Emissions)</Text><Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmtNum(totals?.scope1)}</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCell}>Scope 2 (Indirect Energy)</Text><Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmtNum(totals?.scope2)}</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCell}>Scope 3 (Business Travel)</Text><Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmtNum(totals?.scope3)}</Text></View>
            <View style={[styles.tableRow, styles.summaryTotal]}>
              <Text style={styles.tableCell}>TOTAL CARBON FOOTPRINT</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmtNum(totals?.total)}</Text>
            </View>
            <View style={[styles.tableRow, styles.intensityRow]}>
              <Text style={styles.tableCell}>Carbon Intensity (per revenue unit)</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{footprintIntensity.toFixed(4)} kgCO2e/{st(company?.currency)}</Text>
            </View>
          </View>
        </View>

        <SharedFooter />
      </Page>

      {/* --- PAGE 2: DETAILED BREAKDOWN --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Emissions Breakdown</Text>
          <Text style={styles.reportMeta}>Full granularity across 13 monitored activity sources</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Detailed Breakdown</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>Scope</Text>
              <Text style={[styles.tableCell, { flex: 1.8 }]}>Activity Source</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>Emissions (kg)</Text>
            </View>
            {breakdown && breakdown.map((item: any, i: number) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { flex: 0.6 }]}>{st(item.scope)}</Text>
                <Text style={[styles.tableCell, { flex: 1.8 }]}>{st(item.activity)}</Text>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmtNum(item.emissions)}</Text>
              </View>
            ))}
          </View>
        </View>

        <SharedFooter />
      </Page>

      {/* --- PAGE 3: DECLARATION OF CONFORMITY --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Declaration of Conformity</Text>
          <Text style={styles.reportMeta}>Assurance Level: Limited (Self-Attested)</Text>
        </View>

        {/* 3. Evidence & Assurance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Evidence & Assurance</Text>
          <View style={styles.legalContainer}>
            <Text style={[styles.bodyText, styles.bold, { marginBottom: 4 }]}>Supporting documentation retained by supplier:</Text>
            <View style={styles.bulletList}>
              {activeEvidence.length > 0 ? activeEvidence.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text>{item}</Text>
                </View>
              )) : <Text style={styles.bodyText}>No material data requiring documentation was reported.</Text>}
            </View>
          </View>
        </View>

        {/* 4. Official Attestation */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. Official Attestation</Text>
          <Text style={styles.bodyText}>
            I, <Text style={styles.bold}>{st(company?.signer)}</Text>, acting as an authorized representative, certify that the activity data and financial revenue provided are accurate to the best of my knowledge.
          </Text>
          <View style={styles.signatureWrapper}>
            <Text style={styles.bold}>Authorized Signature</Text>
            <Text style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 2 }}>Certification Date: {dateStr}</Text>
          </View>
        </View>

        {/* 5. Disclaimer & Limitations --- Point 3 is dynamic across 13 fields */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>5. Disclaimer & Limitations</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}><Text style={styles.bulletPoint}>1.</Text><Text><Text style={styles.bold}>Methodology:</Text> Calculations use supplier data and ADEME Base Carbone factors.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletPoint}>2.</Text><Text><Text style={styles.bold}>Assurance:</Text> This report is self-declared and has not undergone third-party verification.</Text></View>
            {/* Pt 3: DYNAMIC BOUNDARY EXCLUSIONS */}
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>3.</Text>
              <View>
                <Text><Text style={styles.bold}>Boundary Exclusions:</Text> assessed but reported as zero activity:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {activeExclusions.map((item, i) => (
                    <Text key={i} style={{ width: '33%', fontSize: 7, color: '#6B7280', marginBottom: 2 }}>- {item}</Text>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.bulletRow}><Text style={styles.bulletPoint}>4.</Text><Text><Text style={styles.bold}>Liability:</Text> Buyers must conduct independent due diligence for CSRD reporting compliance.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletPoint}>5.</Text><Text><Text style={styles.bold}>Verification:</Text> For inquiries, contact <Text style={styles.bold}>contact@vsmeos.fr</Text>.</Text></View>
          </View>
        </View>

        <SharedFooter />
      </Page>
    </Document>
  );
}