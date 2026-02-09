'use client';

import React from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="bg-gray-100 p-6 rounded-full">
        <Settings size={64} className="text-gray-900" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Global Configuration</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          This module is being engineered to handle Dynamic Country Logic (France/India) 
          and custom calculation methodologies (ADEME/IPCC).
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
        In Development
      </div>

      <Link href="/buyer/dashboard" className="text-[#0071E3] hover:underline flex items-center gap-2 mt-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}