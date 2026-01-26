'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useESG } from '@/context/ESGContext';
import { ArrowLeft, Building2, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { companyData, setCompanyData } = useESG();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  // We use a local handler to show a "Saved" animation, 
  // even though AutoSave is working in the background.
  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        router.push('/dashboard'); // Go back to dashboard after save
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
            href="/dashboard" 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
            <p className="text-sm text-gray-500">Manage your company profile and preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
            
            {/* DANGER ZONE: COMPANY NAME */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-900 font-semibold border-b border-gray-100 pb-2">
                    <Building2 size={18} className="text-blue-600"/> 
                    <h3>Organization Identity</h3>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                        Legal Company Name
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        This is the official name used for all generated reports.
                    </p>
                    <input 
                        type="text"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        className="w-full p-4 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Tesla Inc."
                    />
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex justify-end gap-3">
                <Link 
                    href="/dashboard"
                    className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
                <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg active:scale-95 ${
                        isSaved ? 'bg-green-600' : 'bg-black hover:bg-gray-800'
                    }`}
                >
                    {isSaved ? (
                        <>Saved <CheckCircle2 size={18} /></>
                    ) : (
                        <>Update Profile <Save size={18} /></>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}