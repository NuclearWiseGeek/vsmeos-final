'use client';
import { useESG } from '@/context/ESGContext';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function DashboardHome() {
  const { companyData, setCompanyData, activityData } = useESG();
  const [isRevenueFocused, setIsRevenueFocused] = useState(false);

  // Check if user has started
  const hasData = Object.keys(activityData).length > 0;

  const formatCurrency = (val: number) => {
    if (!val) return '';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Company Profile</h1>
        <p className="text-gray-500 mt-2">
            Let's start with the basics. This information will appear in the header of your final ESG Declaration.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Legal Company Name</label>
                <input 
                    type="text" 
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value.toUpperCase()})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="e.g., ACME INDUSTRIES SAS"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters / Site Country</label>
                <input 
                    type="text" 
                    value={companyData.country}
                    onChange={(e) => setCompanyData({...companyData, country: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Calendar Year</label>
                <input 
                    type="text" 
                    value={companyData.year}
                    onChange={(e) => setCompanyData({...companyData, year: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year (FY)</label>
                <input 
                    type="text" 
                    value={companyData.financialYear || ''}
                    onChange={(e) => setCompanyData({...companyData, financialYear: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="e.g. FY 2024-2025"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Currency</label>
                <select 
                    value={companyData.currency}
                    onChange={(e) => setCompanyData({...companyData, currency: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-white transition-all"
                >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                </select>
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue ({companyData.currency})</label>
                <input 
                    type={isRevenueFocused ? "number" : "text"}
                    value={isRevenueFocused ? (companyData.revenue === 0 ? '' : companyData.revenue) : (companyData.revenue ? formatCurrency(companyData.revenue) : '')}
                    onFocus={() => setIsRevenueFocused(true)}
                    onBlur={() => setIsRevenueFocused(false)}
                    onChange={(e) => setCompanyData({...companyData, revenue: parseFloat(e.target.value) || 0})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="0.00"
                />
            </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/dashboard/hub">
            <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-[1.02] flex items-center gap-3 shadow-lg">
                {hasData ? 'Go to Assessment Hub' : 'Save & Continue'} <ArrowRight size={18} />
            </button>
        </Link>
      </div>
    </div>
  );
}