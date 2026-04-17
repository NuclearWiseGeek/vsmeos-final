'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="bg-blue-50 p-6 rounded-full">
        <Construction size={64} className="text-[#0071E3]" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          We are currently building the advanced filtering and detailed supplier profiles. 
          Soon you will be able to see full carbon history for every partner here.
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