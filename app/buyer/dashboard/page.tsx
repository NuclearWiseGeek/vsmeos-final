import React from 'react';
import CSVUploader from '@/components/buyer/CSVUploader';
import InviteTable from '@/components/buyer/InviteTable';
import ManualEntry from '@/components/buyer/ManualEntry';
import { getSuppliers } from '@/actions/buyer';
import { TrendingUp, Users, AlertTriangle, PieChart } from 'lucide-react';

export default async function BuyerDashboard() {
  const suppliers = await getSuppliers();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. KPI CARDS - Apple Style (Clean Border, Soft Shadow) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Suppliers</span>
                <Users size={16} className="text-gray-400"/>
            </div>
            <div className="text-3xl font-bold text-gray-900">{suppliers.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Coverage</span>
                <PieChart size={16} className="text-gray-400"/>
            </div>
            <div className="text-3xl font-bold text-gray-900">0%</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Invites</span>
                <TrendingUp size={16} className="text-gray-400"/>
            </div>
            <div className="text-3xl font-bold text-blue-600">{suppliers.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">High Risk</span>
                <AlertTriangle size={16} className="text-gray-400"/>
            </div>
            <div className="text-3xl font-bold text-rose-600">0</div>
        </div>
      </div>

      {/* 2. BULK ACTION BAR - Now Light & Minimalist */}
      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between">
        <div>
           <h3 className="text-xl font-bold text-gray-900">Bulk Invite Suppliers</h3>
           <p className="text-gray-500 mt-1">Upload your vendor list (CSV) to automate onboarding.</p>
        </div>
        {/* The button inside CSVUploader is Blue, which fits perfectly */}
        <CSVUploader />
      </div>

      {/* 3. MANUAL ADD SECTION */}
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-4 px-1">Quick Add Single Supplier</h3>
        {/* We need to update ManualEntry to be cleaner if it's not already */}
        <ManualEntry />
      </div>

      {/* 4. ACTIVITY FEED */}
      <div>
         <h3 className="font-bold text-lg text-gray-900 mb-4 px-1">Live Activity Feed</h3>
         <InviteTable suppliers={suppliers} />
      </div>
    </div>
  );
}