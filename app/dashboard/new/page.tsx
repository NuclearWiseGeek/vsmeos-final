'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Building2, Factory, Plane, Zap, CheckCircle, ArrowRight, Download, RefreshCw, ChevronLeft 
} from 'lucide-react';
import { calculateFootprint } from '@/app/utils/carbonEngine'; // Importing the brain
import Link from 'next/link';

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  
  // -- State for Inputs (Matching Python variables) --
  const [companyData, setCompanyData] = useState({
    name: '', country: 'France', year: '2025', revenue: 0, currency: 'EUR'
  });
  
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [signerName, setSignerName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // -- Handlers --
  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // -- The PDF Generator (Replicating the Python ReportLab logic) --
  const generatePDF = () => {
    setIsGenerating(true);
    const results = calculateFootprint(inputs);
    const doc = new jsPDF();
    
    // 1. Header & Title
    doc.setFillColor(30, 41, 59); // Dark Blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("CORPORATE CARBON FOOTPRINT", 20, 20);
    doc.setFontSize(10);
    doc.text("Aligned with GHG Protocol & ISO 14064-1", 20, 30);

    // 2. Company Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Company: ${companyData.name}`, 20, 50);
    doc.text(`Site Country: ${companyData.country}`, 20, 55);
    doc.text(`Period: ${companyData.year}`, 20, 60);
    doc.text(`Revenue: ${companyData.revenue} ${companyData.currency}`, 120, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 55);

    // 3. Boundary Statement
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const boundaryText = "BOUNDARY: This report covers Scope 1 (Direct), Scope 2 (Indirect Energy), and selected Scope 3 (Business Travel). Calculations use ADEME Base Carbone emission factors.";
    const splitBoundary = doc.splitTextToSize(boundaryText, 170);
    doc.text(splitBoundary, 20, 75);

    // 4. Summary Table
    let yPos = 95;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica", "bold");
    doc.text("SCOPE", 25, yPos + 7);
    doc.text("EMISSIONS (kgCO2e)", 120, yPos + 7);
    
    yPos += 15;
    doc.setFont("helvetica", "normal");
    
    const drawRow = (label: string, val: number) => {
      doc.text(label, 25, yPos);
      doc.text(val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 120, yPos);
      yPos += 8;
    };

    drawRow("Scope 1 (Direct)", results.scope1);
    drawRow("Scope 2 (Energy)", results.scope2);
    drawRow("Scope 3 (Travel)", results.scope3);
    
    yPos += 2;
    doc.line(20, yPos, 190, yPos);
    yPos += 7;
    doc.setFont("helvetica", "bold");
    drawRow("TOTAL FOOTPRINT", results.total);
    
    // 5. Attestation
    yPos = 240;
    doc.setFont("helvetica", "normal");
    doc.text("ATTESTATION:", 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.text(`I, ${signerName}, certify that the activity data provided is accurate.`, 20, yPos);
    
    doc.line(20, yPos + 20, 80, yPos + 20);
    doc.text("Authorized Signature", 20, yPos + 25);

    doc.save(`${companyData.name}_Carbon_Report.pdf`);
    setIsGenerating(false);
  };

  // --- UI RENDER ---

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Building2 className="text-indigo-600"/> Company Profile</h2>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Legal Name</label>
          <input 
            className="w-full p-2 border rounded" 
            value={companyData.name}
            onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input 
              className="w-full p-2 border rounded" 
              value={companyData.country}
              onChange={(e) => setCompanyData({...companyData, country: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Revenue</label>
            <input 
              type="number"
              className="w-full p-2 border rounded" 
              value={companyData.revenue}
              onChange={(e) => setCompanyData({...companyData, revenue: parseFloat(e.target.value)})}
            />
          </div>
        </div>
        <button 
          onClick={() => companyData.name && setStep(2)}
          disabled={!companyData.name}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Next Step <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600"><Factory size={20}/> Scope 1: Direct Emissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="Natural Gas (kWh)" id="natural_gas" val={inputs.natural_gas} onChange={handleInputChange}/>
          <InputGroup label="Heating Oil (Liters)" id="heating_oil" val={inputs.heating_oil} onChange={handleInputChange}/>
          <InputGroup label="Fleet Diesel (Liters)" id="diesel" val={inputs.diesel} onChange={handleInputChange}/>
          <InputGroup label="Refrigerant R410A (kg)" id="ref_R410A" val={inputs.ref_R410A} onChange={handleInputChange}/>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-600"><Zap size={20}/> Scope 2: Indirect Energy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Electricity (kWh)" id="electricity_fr" val={inputs.electricity_fr} onChange={handleInputChange}/>
          <InputGroup label="District Heating (kWh)" id="district_heat" val={inputs.district_heat} onChange={handleInputChange}/>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><Plane size={20}/> Scope 3: Business Travel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="Employee Cars (km)" id="grey_fleet_avg" val={inputs.grey_fleet_avg} onChange={handleInputChange}/>
          <InputGroup label="Flights (km)" id="flight_avg" val={inputs.flight_avg} onChange={handleInputChange}/>
          <InputGroup label="Hotels (Nights)" id="hotel_night_avg" val={inputs.hotel_night_avg} onChange={handleInputChange}/>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-400">Ready to calculate?</p>
          <p className="font-bold">Generate your carbon footprint report</p>
        </div>
        <button 
          onClick={() => setStep(3)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-lg font-bold transition-colors"
        >
          Calculate Results
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const results = calculateFootprint(inputs);
    
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title="Total Footprint" value={`${results.total.toFixed(2)} kg`} color="bg-slate-800 text-white" />
          <KpiCard title="Scope 1" value={results.scope1.toFixed(0)} color="bg-rose-50 text-rose-700" />
          <KpiCard title="Scope 2" value={results.scope2.toFixed(0)} color="bg-amber-50 text-amber-700" />
          <KpiCard title="Scope 3" value={results.scope3.toFixed(0)} color="bg-blue-50 text-blue-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Detailed Breakdown Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">Detailed Breakdown</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 text-right">Emissions (kg)</th>
                </tr>
              </thead>
              <tbody>
                {results.breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{row.activity}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-slate-100 text-xs">{row.scope}</span></td>
                    <td className="px-4 py-3 text-slate-500">{row.quantity} {row.unit}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">{row.emissions.toFixed(2)}</td>
                  </tr>
                ))}
                {results.breakdown.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No activity data entered.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT: Action Panel */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Finalize Report</h3>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Authorized Signer</label>
              <input 
                className="w-full p-2 mb-4 border rounded text-sm" 
                placeholder="Full Legal Name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />
              <button 
                onClick={generatePDF}
                disabled={!signerName || isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : <><Download size={18}/> Download PDF Report</>}
              </button>
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={14}/> Start New Assessment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      {/* HEADER WITH BACK BUTTON */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
        <Link href="/dashboard/results" className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50">
            <ChevronLeft size={20} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">New Sustainability Assessment</h1>
            <div className="flex items-center gap-2 text-sm mt-2">
            <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1. Profile</span>
            <div className="w-8 h-1 bg-slate-200"></div>
            <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2. Data</span>
            <div className="w-8 h-1 bg-slate-200"></div>
            <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3. Results</span>
            </div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderResults()}
    </div>
  );
}

// --- Helper Components ---
const InputGroup = ({ label, id, val, onChange }: any) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
    <input 
      type="number" 
      min="0"
      className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
      value={val || ''}
      onChange={(e) => onChange(id, e.target.value)}
      placeholder="0"
    />
  </div>
);

const KpiCard = ({ title, value, color }: any) => (
  <div className={`p-4 rounded-xl shadow-sm border border-slate-200/50 ${color}`}>
    <p className="text-xs opacity-80 uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);