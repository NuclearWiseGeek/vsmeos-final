// =============================================================================
// FILE: app/components/CarbonReportPDF.tsx
// PURPOSE: Generates the 4-page GHG Protocol / ISO 14064-1 compliant PDF report.
//          This is the core deliverable of VSME OS — the document a supplier
//          sends to their buyer to satisfy CSRD Scope 3 data requests.
//
// PAGES:
//   Page 1 — Cover + Emissions Summary (scope totals, tCO2e, intensity)
//   Page 2 — Detailed Activity Breakdown (all fields with emission factors)
//   Page 3 — Declaration of Conformity (evidence retained, official attestation)
//   Page 4 — Methodology & Audit Trail (emission factor sources, boundary exclusions, disclaimer)
//
// KEY DESIGN PRINCIPLE — DYNAMIC BY COUNTRY:
//   The report cites the correct national emission factor database based on the
//   supplier's country. A UK supplier's report says "DEFRA 2024". A French
//   supplier's report says "ADEME Base Carbone 2024". This is what makes the
//   report audit-ready and credible to international procurement teams.
//
// WHEN TO MODIFY:
//   - When adding new scope fields (add to ALL_FIELDS and evidence lists)
//   - When updating compliance statement references (CSRD updates, new standards)
//   - Phase 7: Add third-party verification stamp section
//
// DEPENDENCIES:
//   - @react-pdf/renderer — the PDF rendering library
//   - calculations.ts — getCountryFactors() for dynamic source citation
// =============================================================================

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getCountryFactors } from '@/utils/calculations';

// =============================================================================
// SECTION 1: STYLESHEET
// Zinc-based palette matching the VSME OS dashboard.
// Pure black headers, zinc greys for body, emerald for compliance accents.
// =============================================================================

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 50,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#18181b',
    lineHeight: 1.25,
    position: 'relative',
    backgroundColor: '#FFFFFF'
  },

  // Header
  header: {
    marginBottom: 28,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e4e4e7',
    paddingBottom: 14
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: -0.5
  },
  reportMeta: {
    fontSize: 7.5,
    color: '#71717a',
    marginTop: 10
  },

  // Sections
  section: { marginTop: 16, marginBottom: 4 },
  sectionHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#000000',
    paddingLeft: 8
  },
  bodyText: {
    marginBottom: 5,
    color: '#3f3f46',
    textAlign: 'justify'
  },

  // Compliance / info block
  complianceBlock: {
    marginTop: 8,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f4f4f5',
    borderLeftWidth: 1.5,
    borderLeftColor: '#10b981',
    fontSize: 7.8,
    color: '#52525b',
    lineHeight: 1.45
  },
  bold: { fontWeight: 'bold', color: '#000000' },

  // Profile card
  profileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#e4e4e7'
  },
  profileItem: { width: '50%', marginBottom: 7 },
  profileLabel: {
    fontSize: 6.5,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5
  },
  profileValue: { fontSize: 9, fontWeight: 'bold', color: '#18181b' },

  // Headline totals block
  totalsBlock: {
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    overflow: 'hidden'
  },
  totalsCell: {
    flex: 1,
    padding: 14,
    borderRightWidth: 0.5,
    borderRightColor: '#e4e4e7'
  },
  totalsCellLast: { flex: 1, padding: 14 },
  totalsLabel: { fontSize: 6.5, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  totalsValue: { fontSize: 14, fontWeight: 'bold', color: '#000000' },
  totalsUnit: { fontSize: 7, color: '#71717a', marginTop: 3 },

  // Tables
  table: { width: '100%', marginTop: 2 },
  tableRow: {
    flexDirection: 'row',
    minHeight: 22,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f4f4f5'
  },
  tableHeader: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    borderRadius: 2,
    minHeight: 24
  },
  tableCell: { paddingHorizontal: 8, flex: 1 },
  summaryTotal: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontWeight: 'bold',
    minHeight: 26,
    marginTop: 2
  },
  subtleRow: {
    backgroundColor: '#f4f4f5',
    borderBottomWidth: 0
  },
  scopeGroupHeader: {
    backgroundColor: '#f4f4f5',
    minHeight: 18
  },

  // Legal
  legalContainer: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginBottom: 10
  },
  bulletList: { marginTop: 4, marginLeft: 2 },
  bulletRow: {
    marginBottom: 4,
    fontSize: 8,
    color: '#52525b',
    flexDirection: 'row'
  },
  bulletPoint: { width: 14, color: '#a1a1aa', fontWeight: 'bold' },
  signatureWrapper: {
    marginTop: 30,
    width: 220,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 6
  },

  // Footer
  footerFixedContainer: {
    position: 'absolute',
    bottom: 28,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: '#e4e4e7',
    paddingTop: 8
  },
  footerRow: { flexDirection: 'row', alignItems: 'flex-end', width: '100%' },
  footerLeftBox: { flex: 1 },
  footerCenterBox: { flex: 2, textAlign: 'center' },
  footerRightBox: { width: 50, textAlign: 'right' },
  footerText: { fontSize: 6.5, color: '#a1a1aa', marginBottom: 1, letterSpacing: 0.1 },
});

// =============================================================================
// SECTION 2: ALL_FIELDS MASTER LIST
// Defines every monitored activity source, its display label, what evidence
// should be retained by the supplier, and how to reference it in exclusions.
// NOTE: Keys here must match exactly the keys in ESGContext activityData.
// =============================================================================

const ALL_FIELDS = [
  // Scope 1 — Stationary Combustion
  { key: 'natural_gas',        scope: 'Scope 1', label: 'Natural Gas',                      evidence: 'Gas utility invoices (annual total kWh)',              exclusion: 'Natural Gas — Stationary Combustion'        },
  { key: 'heating_oil',        scope: 'Scope 1', label: 'Heating Oil',                      evidence: 'Heating oil delivery receipts (litres)',               exclusion: 'Heating Oil — Stationary Combustion'        },
  { key: 'propane',            scope: 'Scope 1', label: 'Propane / LPG',                    evidence: 'LPG delivery receipts or bottle purchase records',     exclusion: 'Propane / LPG — Stationary Combustion'      },
  // Scope 1 — Mobile Combustion
  { key: 'diesel',             scope: 'Scope 1', label: 'Fleet Diesel',                     evidence: 'Fuel card statements or fleet diesel receipts',        exclusion: 'Fleet Diesel — Mobile Combustion'           },
  { key: 'petrol',             scope: 'Scope 1', label: 'Fleet Petrol / Gasoline',           evidence: 'Fuel card statements or fleet petrol receipts',        exclusion: 'Fleet Petrol — Mobile Combustion'           },
  // Scope 1 — Fugitive Emissions
  { key: 'ref_R410A',          scope: 'Scope 1', label: 'Refrigerant R410A (Fugitive)',      evidence: 'HVAC maintenance log (R410A top-up kg)',               exclusion: 'R410A Refrigerant — Fugitive Emissions'     },
  { key: 'ref_R32',            scope: 'Scope 1', label: 'Refrigerant R32 (Fugitive)',        evidence: 'HVAC maintenance log (R32 top-up kg)',                 exclusion: 'R32 Refrigerant — Fugitive Emissions'       },
  { key: 'ref_R134a',          scope: 'Scope 1', label: 'Refrigerant R134a (Fugitive)',      evidence: 'Vehicle / HVAC service record (R134a top-up kg)',      exclusion: 'R134a Refrigerant — Fugitive Emissions'     },
  { key: 'ref_R404A',          scope: 'Scope 1', label: 'Refrigerant R404A (Fugitive)',      evidence: 'Refrigeration maintenance log (R404A top-up kg)',      exclusion: 'R404A Refrigerant — Fugitive Emissions'     },
  // Scope 2 — Purchased Energy
  { key: 'electricity_grid',   scope: 'Scope 2', label: 'Grid Electricity',                 evidence: 'Electricity utility invoices (annual total kWh)',      exclusion: 'Grid Electricity — Location-Based'          },
  { key: 'electricity_green',  scope: 'Scope 2', label: 'Green / Renewable Electricity',    evidence: 'Guarantee of Origin (GoO) / REC certificates',        exclusion: 'Green Electricity — Market-Based'           },
  { key: 'district_heat',      scope: 'Scope 2', label: 'District Heating',                 evidence: 'District heating network invoices (annual kWh)',       exclusion: 'District Heating'                          },
  { key: 'district_cool',      scope: 'Scope 2', label: 'District Cooling',                 evidence: 'District cooling network invoices (annual kWh)',       exclusion: 'District Cooling'                          },
  // Scope 3 — Business Travel (Cat. 6)
  { key: 'grey_fleet',         scope: 'Scope 3', label: 'Employee Vehicles (Grey Fleet)',   evidence: 'Mileage reimbursement records / expense reports',      exclusion: 'Grey Fleet — Cat. 6 Business Travel'        },
  { key: 'rail_travel',        scope: 'Scope 3', label: 'Rail / Train Travel',              evidence: 'Train booking records or travel expense reports',      exclusion: 'Rail Travel — Cat. 6 Business Travel'       },
  { key: 'flight_short_haul',  scope: 'Scope 3', label: 'Short-Haul Flights (<3,700 km)',   evidence: 'Flight booking records or travel agency reports',      exclusion: 'Short-Haul Flights — Cat. 6 Business Travel'},
  { key: 'flight_long_haul',   scope: 'Scope 3', label: 'Long-Haul Flights (>3,700 km)',    evidence: 'Flight booking records or travel agency reports',      exclusion: 'Long-Haul Flights — Cat. 6 Business Travel' },
  { key: 'hotel_nights',       scope: 'Scope 3', label: 'Hotel Stays',                     evidence: 'Hotel booking records or accommodation expense reports',exclusion: 'Hotel Stays — Cat. 6 Business Travel'       },
  // Scope 3 — Employee Commuting (Cat. 7)
  { key: 'employee_commuting', scope: 'Scope 3', label: 'Employee Commuting',               evidence: 'Employee survey data or commute distance estimates',   exclusion: 'Employee Commuting — Cat. 7'                },
  { key: 'remote_working',     scope: 'Scope 3', label: 'Remote Working Days',              evidence: 'HR records or manager-confirmed WFH day count',        exclusion: 'Remote Working — Cat. 7'                    },
];

// =============================================================================
// SECTION 3: MAIN COMPONENT
// =============================================================================

export default function CarbonReportPDF({ company, totals, breakdown, activityData }: any) {

  // ─── Formatting helpers ─────────────────────────────────────────────────
  const fmtNum = (val: any) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fmtTonnes = (kg: number) => (kg / 1000).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const st = (val: any) => (val ? String(val) : '—');

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // ─── Country-specific data ───────────────────────────────────────────────
  // This is the key change — every citation in the report now reflects the
  // supplier's actual country instead of always saying "ADEME".
  const country = company?.country || 'France';
  const countryFactors = getCountryFactors(country);
  const primarySource = countryFactors.primaryCalculator;
  const methodologyNote = countryFactors.methodologyNote;

  // ─── Emission totals ─────────────────────────────────────────────────────
  const totalKg = parseFloat(totals?.total) || 0;
  const totalTonnes = totalKg / 1000;
  const scope1Kg = parseFloat(totals?.scope1) || 0;
  const scope2Kg = parseFloat(totals?.scope2) || 0;
  const scope3Kg = parseFloat(totals?.scope3) || 0;

  // ─── Carbon intensity ────────────────────────────────────────────────────
  // kgCO2e per million EUR/USD/GBP of revenue
  // Different from old formula (which divided by raw revenue, giving tiny numbers)
  const revenue = parseFloat(company?.revenue) || 0;
  const intensity = revenue > 0 ? (totalKg / (revenue / 1_000_000)) : 0;
  const currency = company?.currency || 'EUR';

  // ─── Evidence & exclusions (dynamic from entered data) ──────────────────
  const activeEvidence: string[] = [];
  const activeExclusions: string[] = [];
  const seenEvidence = new Set<string>();

  ALL_FIELDS.forEach(field => {
    const val = parseFloat(activityData?.[field.key] || '0');
    if (val > 0) {
      if (!seenEvidence.has(field.evidence)) {
        activeEvidence.push(field.evidence);
        seenEvidence.add(field.evidence);
      }
    } else {
      activeExclusions.push(field.exclusion);
    }
  });

  // ─── Shared footer ───────────────────────────────────────────────────────
  // Footer is dynamic — shows the correct national database for this supplier
  const SharedFooter = () => (
    <View style={styles.footerFixedContainer} fixed>
      <View style={styles.footerRow}>
        <View style={styles.footerCenterBox}>
          <Text style={[styles.footerText, { textAlign: 'center' }]}>
            Emission factors: {primarySource}
          </Text>
          <Text style={[styles.footerText, { textAlign: 'center' }]}>
            GHG Protocol · ISO 14064-1:2018 · Commission Recommendation (EU) 2025/1710
          </Text>
        </View>
        <View style={styles.footerRightBox}>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </View>
    </View>
  );

  // =============================================================================
  // PAGE 1: COVER + EMISSIONS SUMMARY
  // =============================================================================

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Page 1 Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Corporate Carbon Footprint Declaration</Text>
          <Text style={styles.reportMeta}>
            Report Generated: {dateStr} · Assurance Level: Self-Attested (Limited) · Prepared by VSME OS
          </Text>
        </View>

        {/* ── 1.1 Company Profile Card ─────────────────────────────── */}
        <View style={styles.profileContainer}>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Legal Entity</Text>
            <Text style={styles.profileValue}>{st(company?.name)}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Financial Year</Text>
            <Text style={styles.profileValue}>FY {st(company?.year)}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Country of Operations</Text>
            <Text style={styles.profileValue}>{st(country)}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Annual Revenue</Text>
            <Text style={styles.profileValue}>
              {`${fmtNum(revenue)} ${currency}`}
            </Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Industry Sector</Text>
            <Text style={styles.profileValue}>{st(company?.industry) || 'Not specified'}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Emission Factor Database</Text>
            {/* DYNAMIC: shows DEFRA for UK, ADEME for France, EPA for USA etc. */}
            <Text style={styles.profileValue}>{primarySource}</Text>
          </View>
        </View>

        {/* ── 1.2 Compliance Statement ─────────────────────────────── */}
        <View style={styles.complianceBlock}>
          <Text style={styles.bold}>Reporting Standards & Methodological Alignment:</Text>
          <Text>• GHG Protocol Corporate Accounting and Reporting Standard (WRI/WBCSD)</Text>
          <Text>• ISO 14064-1:2018 — Specification for quantification of GHG emissions</Text>
          <Text>• Commission Recommendation (EU) 2025/1710 of 30 July 2025 — voluntary sustainability reporting standard for SMEs</Text>
          <Text>• CSRD ESRS E1 — Climate change disclosure requirements</Text>
          {/* DYNAMIC: the methodology note is specific to this supplier's country */}
          <Text style={{ marginTop: 4, color: '#71717a' }}>{methodologyNote}</Text>
        </View>


        {/* ── 1.3 Headline Total ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Total Carbon Footprint — FY {st(company?.year)}</Text>
        </View>

        {/* Scope summary table */}
        <View style={{ marginBottom: 14 }}>
          {/* Column headers */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f4f4f5', paddingVertical: 7, paddingHorizontal: 12 }}>
            <Text style={{ flex: 1.2, fontSize: 6.5, fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Scope</Text>
            <Text style={{ flex: 2.5, fontSize: 6.5, fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Emission Category</Text>
            <Text style={{ flex: 1.3, fontSize: 6.5, fontWeight: 'bold', color: '#71717a', letterSpacing: 0.5, textAlign: 'right' }}>Kilograms CO₂e</Text>
            <Text style={{ flex: 1.1, fontSize: 6.5, fontWeight: 'bold', color: '#71717a', letterSpacing: 0.5, textAlign: 'right' }}>Tonnes CO₂e</Text>
            <Text style={{ flex: 0.9, fontSize: 6.5, fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>% of Total</Text>
          </View>

          {[
            { label: 'Scope 1', desc: 'Direct Emissions — Stationary & Mobile Combustion, Fugitive Refrigerants', kg: scope1Kg },
            { label: 'Scope 2', desc: 'Indirect Emissions — Purchased Electricity, District Heat & Cooling',      kg: scope2Kg },
            { label: 'Scope 3', desc: 'Value Chain — Business Travel & Employee Commuting',                       kg: scope3Kg },
          ].map((row, i) => (
            <View key={row.label} style={{
              flexDirection: 'row',
              paddingVertical: 11,
              paddingHorizontal: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: '#e4e4e7',
              backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#fafafa',
              alignItems: 'center',
            }}>
              <Text style={{ flex: 1.2, fontSize: 8.5, fontWeight: 'bold', color: '#000000' }}>{row.label}</Text>
              <Text style={{ flex: 2.5, fontSize: 7.8, color: '#52525b', lineHeight: 1.4 }}>{row.desc}</Text>
              <Text style={{ flex: 1.3, fontSize: 8.5, fontWeight: 'bold', color: '#18181b', textAlign: 'right' }}>{fmtNum(row.kg)}</Text>
              <Text style={{ flex: 1.1, fontSize: 8.5, color: '#52525b', textAlign: 'right' }}>{fmtTonnes(row.kg)}</Text>
              <Text style={{ flex: 0.9, fontSize: 8.5, color: '#52525b', textAlign: 'right' }}>{((row.kg / (totalKg || 1)) * 100).toFixed(1)}%</Text>
            </View>
          ))}

          {/* Total row */}
          <View style={{
            flexDirection: 'row',
            paddingVertical: 11,
            paddingHorizontal: 12,
            backgroundColor: '#18181b',
            alignItems: 'center',
          }}>
            <Text style={{ flex: 1.2, fontSize: 8.5, fontWeight: 'bold', color: '#FFFFFF' }}>Total</Text>
            <Text style={{ flex: 2.5, fontSize: 7.8, color: '#a1a1aa' }}>All Scopes Combined</Text>
            <Text style={{ flex: 1.3, fontSize: 8.5, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' }}>{fmtNum(totalKg)}</Text>
            <Text style={{ flex: 1.1, fontSize: 8.5, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' }}>{fmtTonnes(totalKg)}</Text>
            <Text style={{ flex: 0.9, fontSize: 8.5, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' }}>100%</Text>
          </View>

          {/* Carbon Intensity row */}
          <View style={{
            flexDirection: 'row',
            paddingVertical: 11,
            paddingHorizontal: 12,
            backgroundColor: '#27272a',
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            alignItems: 'center',
          }}>
            <Text style={{ flex: 1.2, fontSize: 8.5, fontWeight: 'bold', color: '#a1a1aa' }}>Intensity</Text>
            <Text style={{ flex: 2.5, fontSize: 7.8, color: '#71717a', lineHeight: 1.6 }}>
              Carbon Intensity (ESRS E1-6){'\n'}Revenue: {currency} {fmtNum(revenue)}
            </Text>
            {/* Option A — per M currency (industry standard) */}
            <View style={{ flex: 1.3, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#e4e4e7', textAlign: 'right' }}>{fmtNum(intensity)}</Text>
              <Text style={{ fontSize: 6, color: '#71717a', textAlign: 'right', marginTop: 2 }}>kgCO₂e / M{currency}</Text>
            </View>
            {/* Option B — per actual revenue */}
            <View style={{ flex: 1.1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#e4e4e7', textAlign: 'right' }}>
                {revenue > 0 ? (totalKg / revenue).toFixed(4) : '—'}
              </Text>
              <Text style={{ fontSize: 6, color: '#71717a', textAlign: 'right', marginTop: 2 }}>kgCO₂e / {currency}</Text>
            </View>
            <View style={{ flex: 0.9 }} />
          </View>
        </View>

        <SharedFooter />
      </Page>

      {/* =============================================================================
          PAGE 2: DETAILED ACTIVITY BREAKDOWN
          ============================================================================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Emissions Breakdown</Text>
          <Text style={styles.reportMeta}>
            {company?.name} · FY {st(company?.year)} · All values in kgCO₂e
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Detailed Emissions by Activity Source</Text>

          <View style={styles.table}>
            {/* Table header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.55 }]}>Scope</Text>
              <Text style={[styles.tableCell, { flex: 1.7  }]}>Activity Source</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right' }]}>Quantity</Text>
              <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right' }]}>Factor /unit</Text>
              <Text style={[styles.tableCell, { flex: 0.85, textAlign: 'right' }]}>kgCO₂e</Text>
            </View>

            {/* Scope group dividers + data rows */}
            {(['Scope 1', 'Scope 2', 'Scope 3'] as const).map(scope => {
              // Filter breakdown rows for this scope
              const scopeRows = (breakdown || []).filter((r: any) => r.scope === scope);
              if (scopeRows.length === 0) return null;

              const scopeTotal = scopeRows.reduce((s: number, r: any) => s + (parseFloat(r.emissions) || 0), 0);

              return (
                <View key={scope}>
                  {/* Scope group header row */}
                  <View style={[styles.tableRow, styles.scopeGroupHeader]}>
                    <Text style={[styles.tableCell, { flex: 4.4, fontWeight: 'bold', fontSize: 8, color: '#52525b' }]}>
                      {scope === 'Scope 1' ? 'SCOPE 1 — Direct Emissions (Fuel Combustion & Fugitive)' :
                       scope === 'Scope 2' ? 'SCOPE 2 — Indirect Energy (Purchased Electricity & Heat)' :
                       'SCOPE 3 — Value Chain (Travel, Commuting & Remote Work)'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 0.85, textAlign: 'right', fontWeight: 'bold', fontSize: 8, color: '#52525b' }]}>
                      {fmtNum(scopeTotal)}
                    </Text>
                  </View>

                  {/* Individual activity rows */}
                  {scopeRows.map((item: any, i: number) => {
                    // Find matching field definition for display label
                    const field = ALL_FIELDS.find(f => f.label === item.activity || f.key === item.id);
                    const label = field?.label || item.activity || '—';

                    return (
                      <View key={i} style={styles.tableRow} wrap={false}>
                        <Text style={[styles.tableCell, { flex: 0.55, color: '#a1a1aa', fontSize: 7.5 }]}>
                          {item.scope}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 1.7 }]}>{label}</Text>
                        <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right', color: '#71717a' }]}>
                          {item.quantity != null
                            ? `${parseFloat(item.quantity).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${item.unit || ''}`
                            : '—'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right', color: '#71717a', fontSize: 7.5 }]}>
                          {item.factorRef != null
                            ? `${parseFloat(item.factorRef).toFixed(3)} /${item.unit || ''}`
                            : '—'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 0.85, textAlign: 'right' }]}>
                          {fmtNum(item.emissions)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}

            {/* Grand total row */}
            <View style={[styles.tableRow, styles.summaryTotal]}>
              <Text style={[styles.tableCell, { flex: 3.55 }]}>TOTAL CARBON FOOTPRINT</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right' }]}> </Text>
              <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right' }]}> </Text>
              <Text style={[styles.tableCell, { flex: 0.85, textAlign: 'right' }]}>
                {fmtNum(totalKg)}
              </Text>
            </View>
          </View>
        </View>

        <SharedFooter />
      </Page>

      {/* =============================================================================
          PAGE 3: DECLARATION OF CONFORMITY
          ============================================================================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Declaration of Conformity</Text>
          <Text style={styles.reportMeta}>
            {company?.name} · FY {st(company?.year)} · Assurance Level: Self-Attested (Limited)
          </Text>
        </View>

        {/* ── 3. Evidence Retained ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Supporting Evidence Retained by Supplier</Text>
          <View style={styles.legalContainer}>
            <Text style={[styles.bodyText, styles.bold, { marginBottom: 5 }]}>
              The following documentation supports the data declared in this report
              and must be retained for a minimum of 5 years (EU CSRD requirement):
            </Text>
            <View style={styles.bulletList}>
              {activeEvidence.length > 0
                ? activeEvidence.map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text>{item}</Text>
                    </View>
                  ))
                : (
                    <Text style={styles.bodyText}>
                      No material activity data was reported. All fields were assessed and recorded as zero.
                    </Text>
                  )}
            </View>
          </View>
        </View>

        {/* ── 4. Attestation ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. Official Attestation</Text>
          <Text style={styles.bodyText}>
            I, <Text style={styles.bold}>{st(company?.signer)}</Text>, acting as an authorised
            representative of <Text style={styles.bold}>{st(company?.name)}</Text>, certify that:
          </Text>
          <View style={[styles.bulletList, { marginTop: 6 }]}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text>The activity data provided is accurate and complete to the best of my knowledge.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text>Supporting documentation as listed above is retained and available upon request.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text>
                This declaration is aligned with the <Text style={styles.bold}>GHG Protocol</Text>,{' '}
                <Text style={styles.bold}>ISO 14064-1:2018</Text>, and{' '}
                <Text style={styles.bold}>Commission Recommendation (EU) 2025/1710 of 30 July 2025</Text>.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text>Emission calculations used <Text style={styles.bold}>{primarySource}</Text> factors.</Text>
            </View>
          </View>

          {/* Signatory — last element on Page 3 */}
          <View style={styles.signatureWrapper}>
            <Text style={styles.bold}>{st(company?.signer)}</Text>
            <Text style={{ fontSize: 7.5, color: '#a1a1aa', marginTop: 2 }}>
              Authorised Signatory · {dateStr}
            </Text>
          </View>
        </View>

        <SharedFooter />
      </Page>

      {/* =============================================================================
          PAGE 4: METHODOLOGY & AUDIT TRAIL
          ============================================================================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Methodology & Audit Trail</Text>
          <Text style={styles.reportMeta}>
            {company?.name} · FY {st(company?.year)} · {primarySource}
          </Text>
        </View>

        {/* ── Emission Factor Sources ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Emission Factor Sources</Text>
          <View style={[styles.complianceBlock, { marginTop: 4 }]}>
            <Text>Scope 1 (Fuels): ADEME Base Carbone 2024 (full lifecycle) · Scope 1 (Refrigerants): IPCC AR5 GWP100</Text>
            {/* Scope 2 — only show factors for sources the supplier actually used */}
            {[
              parseFloat(activityData?.electricity_grid || '0') > 0 && `Grid Electricity: ${countryFactors.electricityGrid} kgCO₂e/kWh`,
              parseFloat(activityData?.electricity_green || '0') > 0 && `Green Electricity: 0.000 kgCO₂e/kWh (market-based, GHG Protocol)`,
              parseFloat(activityData?.district_heat || '0') > 0 && `District Heating: ${countryFactors.districtHeating} kgCO₂e/kWh`,
              parseFloat(activityData?.district_cool || '0') > 0 && `District Cooling: ${countryFactors.districtCooling} kgCO₂e/kWh`,
            ].filter(Boolean).length > 0 && (
              <Text>
                Scope 2 ({primarySource}): {[
                  parseFloat(activityData?.electricity_grid || '0') > 0 && `Grid Electricity: ${countryFactors.electricityGrid} kgCO₂e/kWh`,
                  parseFloat(activityData?.electricity_green || '0') > 0 && `Green Electricity: 0.000 kgCO₂e/kWh (market-based)`,
                  parseFloat(activityData?.district_heat || '0') > 0 && `District Heating: ${countryFactors.districtHeating} kgCO₂e/kWh`,
                  parseFloat(activityData?.district_cool || '0') > 0 && `District Cooling: ${countryFactors.districtCooling} kgCO₂e/kWh`,
                ].filter(Boolean).join(' · ')}
              </Text>
            )}
            <Text>Scope 3 (Travel): DEFRA 2025 — Flight factors include Radiative Forcing ×1.9 (IPCC, GHG Protocol)</Text>
            <Text>Scope 3 (Commuting/WFH): DEFRA 2024 / ADEME Base Carbone 2024 · Hotels: Cornell/Greenview CHSB 2024</Text>
          </View>
        </View>

        {/* ── 5. Boundary Exclusions ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>5. Boundary Exclusions</Text>
          <Text style={[styles.bodyText, { marginBottom: 8 }]}>
            The following emission sources were assessed within the reporting boundary
            and recorded as zero activity for FY {st(company?.year)}:
          </Text>
          {(['Scope 1', 'Scope 2', 'Scope 3'] as const).map(scope => {
            const scopeExclusions = ALL_FIELDS.filter(f => {
              const val = parseFloat(activityData?.[f.key] || '0');
              return f.scope === scope && val <= 0;
            });
            if (scopeExclusions.length === 0) return null;
            return (
              <View key={scope} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#52525b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {scope === 'Scope 1' ? 'Scope 1 — Direct Emissions' :
                   scope === 'Scope 2' ? 'Scope 2 — Indirect Energy' :
                   'Scope 3 — Value Chain'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {scopeExclusions.map((f, i) => (
                    <Text key={i} style={{ width: '50%', fontSize: 7, color: '#71717a', marginBottom: 2 }}>
                      — {f.exclusion}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── 6. Disclaimer & Limitations ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>6. Disclaimer & Limitations</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text>
                <Text style={styles.bold}>Methodology: </Text>
                Emission calculations are based on supplier-provided activity data and the emission factor
                database specified above. VSME OS does not independently verify input data accuracy.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text>
                <Text style={styles.bold}>Assurance Level: </Text>
                This is a self-attested declaration (limited assurance). It has not been independently
                verified by a third party. For independently verified reports, contact VSME OS.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>3.</Text>
              <Text>
                <Text style={styles.bold}>Scope Boundary: </Text>
                This report covers Scope 1 (direct), Scope 2 (purchased energy), and selected
                Scope 3 categories (business travel, employee commuting, remote working).
                Upstream supply chain (Scope 3 Cat. 1–4) and downstream categories are excluded.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>4.</Text>
              <Text>
                <Text style={styles.bold}>Buyer Responsibility: </Text>
                Buyers incorporating this data into CSRD or other regulatory disclosures should
                conduct appropriate due diligence on supplier data quality.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>5.</Text>
              <Text>
                <Text style={styles.bold}>Verification Enquiries: </Text>
                For questions about this report, contact{' '}
                <Text style={styles.bold}>contact@vsmeos.fr</Text> or visit{' '}
                <Text style={styles.bold}>vsmeos.fr/methodology</Text>.
              </Text>
            </View>
          </View>
        </View>


        <SharedFooter />
      </Page>
    </Document>
  );
}