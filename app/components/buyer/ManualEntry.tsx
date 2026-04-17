'use client';

// =============================================================================
// FILE: app/components/buyer/ManualEntry.tsx
// PURPOSE: Manual supplier add form for the buyer dashboard.
// PHASE 3 + FIX: Added Financial Year field so the invite email pre-fills
//                the year in the supplier's profile form — eliminates human error.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { addManualSupplier } from '@/actions/buyer';
import { useRouter } from 'next/navigation';

// Generate year options: current year and 3 years back
function getYearOptions(): string[] {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2, current - 3].map(String);
}

export default function ManualEntry() {
  const router  = useRouter();
  const [name,          setName]         = useState('');
  const [email,         setEmail]        = useState('');
  const [financialYear, setFinancialYear] = useState<string>('');
  const [loading,       setLoading]      = useState(false);
  const [isMounted,     setIsMounted]    = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Default to previous year (most common CSRD reporting year)
    setFinancialYear(String(new Date().getFullYear() - 1));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    await addManualSupplier(name, email, financialYear || undefined);
    setName('');
    setEmail('');
    setFinancialYear(String(new Date().getFullYear() - 1));
    setLoading(false);
    router.refresh();
  };

  if (!isMounted) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[140px] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" />
      </div>
    );
  }

  const years = getYearOptions();

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Add Supplier Manually</h3>
      <p className="text-xs text-gray-400 mb-4">
        The financial year is sent in the invite email — the supplier won't need to fill it in.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 items-end">

        {/* Company Name */}
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
            Company Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Acme Corp"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C2918] focus:border-[#0C2918] outline-none transition-all text-sm"
          />
        </div>

        {/* Email */}
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="contact@company.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C2918] focus:border-[#0C2918] outline-none transition-all text-sm"
          />
        </div>

        {/* Financial Year */}
        <div className="w-full md:w-36 flex-shrink-0">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
            Financial Year
          </label>
          <select
            value={financialYear}
            onChange={e => setFinancialYear(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C2918] focus:border-[#0C2918] outline-none transition-all text-sm bg-white"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0C2918] text-[#C9A84C] px-5 py-2 rounded-lg font-bold hover:bg-[#122F1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[90px] text-sm h-[38px]"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /> Add</>}
        </button>

      </form>
    </div>
  );
}