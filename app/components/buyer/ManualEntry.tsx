'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { addManualSupplier } from '@/actions/buyer';
import { useRouter } from 'next/navigation';

export default function ManualEntry() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🟢 1. Add "Mounted" State
  const [isMounted, setIsMounted] = useState(false);

  // 🟢 2. Set Mounted to true only after the browser loads
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    await addManualSupplier(name, email);
    setName('');
    setEmail('');
    setLoading(false);
    router.refresh();
  };

  // 🟢 3. Show a placeholder while waiting (Prevents the crash)
  if (!isMounted) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[140px] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" />
      </div>
    );
  }

  // 🟢 4. Render the real form (Now safe from Hydration errors)
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Supplier Manually</h3>
      
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
            Company Name
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
            Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@company.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add</>}
        </button>
      </form>
    </div>
  );
}