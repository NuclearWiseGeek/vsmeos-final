'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Loader2 } from 'lucide-react'; 
import { useESG } from '@/context/ESGContext'; 
import { getPendingInvite, updateCompanyProfile } from '@/actions/supplier'; 
import { useRouter } from 'next/navigation';

// --- MACRO INDUSTRY LIST (GICS Sectors + Key Verticals) ---
const INDUSTRIES = [
  "Agriculture & Food Production",
  "Automotive & Transportation",
  "Banking & Financial Services",
  "Chemicals & Materials",
  "Construction & Real Estate",
  "Consumer Goods (FMCG)",
  "Education & Training",
  "Energy (Oil, Gas, Mining)",
  "Energy (Renewables)",
  "Healthcare & Pharmaceuticals",
  "Hospitality, Tourism & Leisure",
  "Information Technology & SaaS",
  "Logistics & Supply Chain",
  "Manufacturing (Heavy)",
  "Manufacturing (Light)",
  "Media & Telecommunications",
  "Professional Services (Consulting, Legal)",
  "Public Sector & Government",
  "Retail & E-Commerce",
  "Textiles & Apparel",
  "Utilities & Waste Management",
  "Other"
];

export default function DashboardHome() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { companyData, setCompanyData } = useESG();
  const [invite, setInvite] = useState<any>(null); 
  
  // Local state for formatted revenue display (e.g. "1,000,000")
  const [displayRevenue, setDisplayRevenue] = useState("");

  // 🟢 FIX: Check for invite AND pre-fill the Locked Name
  useEffect(() => {
    getPendingInvite().then((data) => {
       if (data) {
         setInvite(data);
         // Automatically fill the locked name so the button works
         if (data.supplier_name) {
            setCompanyData((prev: any) => ({ ...prev, name: data.supplier_name }));
         }
       }
    });
  }, [setCompanyData]);

  useEffect(() => {
    if (companyData.revenue) {
      setDisplayRevenue(companyData.revenue.toLocaleString('en-US'));
    }
  }, [companyData.revenue]);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      setCompanyData({ ...companyData, revenue: parseFloat(rawValue) || 0 });
      if (rawValue === "") {
        setDisplayRevenue("");
      } else {
        setDisplayRevenue(Number(rawValue).toLocaleString('en-US')); 
      }
    }
  };

  const handleRevenueBlur = () => {
    if (companyData.revenue) {
      setDisplayRevenue(companyData.revenue.toLocaleString('en-US'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* 🟢 NEW: WELCOME BANNER */}
      {invite && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
           <div className="bg-blue-600 text-white p-2 rounded-lg mt-1">
              <Bell size={20} />
           </div>
           <div>
              <h3 className="font-bold text-blue-900 text-lg">Request from {invite.buyer_name || 'Your Partner'}</h3>
              <p className="text-blue-700 mt-1 text-sm leading-relaxed">
                 You have been invited to submit your ESG data. Please complete your Company Profile below to unlock the report builder.
              </p>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
          Company Profile
        </h1>
        <p className="text-sm text-gray-500">
          Start by defining the entity you are reporting for.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-8">
          
          {/* 1. LEGAL NAME (Full Width for Emphasis) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
              Legal Company Name
            </label>
            
            <div className="relative group">
              <input 
                type="text"
                value={companyData.name}
                readOnly 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 cursor-not-allowed select-none focus:outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded">LOCKED</span>
              </div>
            </div>
          </div>

          {/* 2. COUNTRY & INDUSTRY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Headquarters / Site Country
              </label>
              <input 
                type="text"
                value={companyData.country}
                onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                placeholder="e.g. France"
                className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Industry Sector
              </label>
              <div className="relative">
                <select 
                  value={companyData.industry || ""}
                  onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FINANCIAL YEAR & CURRENCY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Financial Year (FY)
              </label>
              <input 
                type="number"
                value={companyData.year}
                onChange={(e) => setCompanyData({ ...companyData, year: e.target.value })}
                placeholder="2024"
                className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Reporting Currency
              </label>
              <div className="relative">
                <select 
                  value={companyData.currency || "EUR"}
                  onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 4. REVENUE (Full Width for importance) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
              Annual Revenue ({companyData.currency || "EUR"})
            </label>
            <input 
              type="text"
              value={displayRevenue}
              onChange={handleRevenueChange}
              onBlur={handleRevenueBlur}
              placeholder="0.00"
              className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
            />
          </div>

        </div>

        {/* FOOTER ACTIONS - UPDATED TO SAVE & REDIRECT */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={async () => {
              if (companyData.name.length <= 1) return;
              
              setSaving(true);
              
              // 1. Save to Database
              await updateCompanyProfile({
                country: companyData.country,
                industry: companyData.industry,
                year: companyData.year,
                currency: companyData.currency,
                revenue: companyData.revenue
              });

              // 2. Redirect to Hub
              router.push('/supplier/hub');
            }}
            disabled={saving || companyData.name.length <= 1}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
              companyData.name.length > 1 
                ? 'bg-black text-white hover:bg-gray-800 shadow-gray-200' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={16}/> Saving...</>
            ) : (
              <>Save & Continue <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}