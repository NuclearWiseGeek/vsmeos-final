'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function CompanyProfile() {
  const router = useRouter();
  const { data, setData } = useESG();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.companyName || !data.revenue) {
      alert("Company Name and Revenue are required.");
      return;
    }
    // FIX: Redirect to the Hub (Dashboard), NOT the deleted assessment page
    router.push('/dashboard'); 
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-3xl mx-auto mb-12 border-b border-gray-800 pb-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Back to Hub</Link>
        <h1 className="text-2xl font-bold mt-2">Step 1: Company Profile</h1>
        <p className="text-gray-400 text-sm italic">Aligned with GHG Protocol (Scope 1, 2 & Business Travel)</p>
      </nav>

      <main className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Company Legal Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none"
              placeholder="e.g. VSME SOLUTIONS SAS"
              value={data.companyName}
              onChange={(e) => setData({ ...data, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Site Country</label>
              <input 
                type="text" 
                className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none"
                value={data.country}
                onChange={(e) => setData({ ...data, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Annual Revenue (EUR)</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none"
                placeholder="0.00"
                value={data.revenue}
                onChange={(e) => setData({ ...data, revenue: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
          >
            Save Profile & Go to Dashboard ➔
          </button>
        </form>
      </main>
    </div>
  );
}