// components/PDFReport.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { ActivityResult, Totals } from '@/utils/calculations';

// Create styles matching your Python PDF
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#000' },
  text: { marginBottom: 4, lineHeight: 1.4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  
  // Table
  table: { width: '100%', marginTop: 10, borderLeft: '1px solid #eee', borderTop: '1px solid #eee' },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#000080', color: 'white', fontWeight: 'bold' },
  tableCell: { padding: 5, borderRight: '1px solid #eee', borderBottom: '1px solid #eee', fontSize: 9 },
  
  // Summary Box
  summaryBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, paddingTop: 5, borderTop: '1px solid #ddd' },
  totalText: { fontSize: 12, fontWeight: 'bold', color: '#000080' },
  
  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' }
});

interface PDFProps {
    company: any;
    results: ActivityResult[];
    totals: Totals;
    signer: string;
}

export const PDFReport = ({ company, results, totals, signer }: PDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CORPORATE CARBON FOOTPRINT DECLARATION</Text>
        <Text style={styles.subtitle}>Methodology Aligned with GHG Protocol & ISO 14064-1</Text>
        <Text style={{ marginTop: 10 }}>Date: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Company Details */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Company Name:</Text> {company.name}</Text>
        <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Site Country:</Text> {company.country}</Text>
        <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Reporting Period:</Text> {company.year}</Text>
        <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Revenue:</Text> {company.revenue} {company.currency}</Text>
      </View>

      {/* Boundary */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>BOUNDARY STATEMENT:</Text>
        <Text style={styles.text}>
            This report covers Scope 1 (Direct), Scope 2 (Energy Indirect), and selected Scope 3 (Business Travel). 
            Calculations use ADEME Base Carbone emission factors.
        </Text>
      </View>

      {/* Executive Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.sectionTitle}>EMISSIONS SUMMARY</Text>
        <View style={styles.row}><Text>Scope 1 (Direct)</Text><Text>{totals.scope1.toFixed(2)} kgCO2e</Text></View>
        <View style={styles.row}><Text>Scope 2 (Indirect Energy)</Text><Text>{totals.scope2.toFixed(2)} kgCO2e</Text></View>
        <View style={styles.row}><Text>Scope 3 (Business Travel)</Text><Text>{totals.scope3.toFixed(2)} kgCO2e</Text></View>
        
        <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL FOOTPRINT</Text>
            <Text style={styles.totalText}>{totals.total.toFixed(2)} kgCO2e</Text>
        </View>
        <View style={{ marginTop: 5 }}>
            <Text>Intensity: {(totals.total / (company.revenue || 1)).toFixed(4)} kgCO2e / {company.currency}</Text>
        </View>
      </View>

      {/* Detail Table */}
      <Text style={styles.sectionTitle}>DETAILED BREAKDOWN</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '20%' }]}>Scope</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>Activity</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>Qty</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>Emissions</Text>
        </View>
        {results.map((row, i) => (
            <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '20%' }]}>{row.scope}</Text>
                <Text style={[styles.tableCell, { width: '40%' }]}>{row.activity}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{row.quantity} {row.unit}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{row.emissions.toFixed(2)}</Text>
            </View>
        ))}
      </View>

      {/* Attestation */}
      <View style={{ marginTop: 30, padding: 10, border: '1px solid #eee' }}>
        <Text style={styles.sectionTitle}>ATTESTATION</Text>
        <Text style={styles.text}>
            I, {signer || "____________________"}, certify that the activity data and revenue provided are accurate to the best of my knowledge.
        </Text>
        <Text style={{ marginTop: 30 }}>__________________________</Text>
        <Text style={{ fontSize: 8 }}>Authorized Signature</Text>
      </View>

      {/* Disclaimer */}
      <View style={{ marginTop: 20 }}>
         <Text style={{ fontSize: 7, color: '#666' }}>
            DISCLAIMER: Calculations use supplier-provided activity data and ADEME Base Carbone v23.0 factors. 
            This report is self-declared. Buyers must conduct due diligence for CSRD compliance.
         </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated by VSME Supplier ESG OS • Aligned with GHG Protocol & ISO 14064-1 • Supports CSRD ESRS E1
      </Text>
    </Page>
  </Document>
);