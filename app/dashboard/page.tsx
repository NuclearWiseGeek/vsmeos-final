'use client';
import React from 'react';
import Link from 'next/link';
import { useESG } from '../context/ESGContext';

export default function DashboardHub() {
  const { data } = useESG();

  // --- Quick Math for the Cards ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1, diesel: 3.16, petrol: 2.8, r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, districtHeat: 0.170, vehicleKm: 0.218, flightKm: 0.14, hotelNights: 6.9
  };

  const s1 = (data.gas * FACTORS.gas) + (data.heatingOil * FACTORS.heatingOil) + (data.propane * FACTORS.propane) +
             (data.diesel * FACTORS.diesel) + (data.petrol * FACTORS.petrol) +
             (data.r410a * FACTORS.r410a) + (data.r32 * FACTORS.r32) + (data.r134a * FACTORS.r134a);
  const s2 = (data.elec * FACTORS.elec) + (data.districtHeat * FACTORS.districtHeat);
  const s3 = (data.vehicleKm * FACTORS.vehicleKm) + (data.flightKm * FACTORS.flightKm) + (data.hotelNights * FACTORS.hotelNights);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-5xl mx-auto mb-12 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ESG Command Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">{data.companyName || "No Company Selected"}</p>
        </div>
        <Link href="/dashboard/profile" className="text-gray-500 hover:text-white text-sm">Edit Profile</Link>
      </nav>

      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Scope 1 Card */}
          <Link href="/dashboard/scope1" className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-9xl font-bold text-orange-500">1</div>
            <h2 className="text-xl font-bold text-orange-400 mb-2">Scope 1</h2>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">Direct Emissions</p>
            <div className="text-3xl font-bold text-white mb-1">{s1.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <p className="text-xs text-gray-500">kgCO2e</p>
            <div className="mt-6 text-orange-400 text-sm font-bold group-hover:translate-x-2 transition-transform">Edit Data ➔</div>
          </Link>

          {/* Scope 2 Card */}
          <Link href="/dashboard/scope2" className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-9xl font-bold text-blue-500">2</div>
            <h2 className="text-xl font-bold text-blue-400 mb-2">Scope 2</h2>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">Indirect Energy</p>
            <div className="text-3xl font-bold text-white mb-1">{s2.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <p className="text-xs text-gray-500">kgCO2e</p>
            <div className="mt-6 text-blue-400 text-sm font-bold group-hover:translate-x-2 transition-transform">Edit Data ➔</div>
          </Link>

          {/* Scope 3 Card */}
          <Link href="/dashboard/scope3" className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-9xl font-bold text-purple-500">3</div>
            <h2 className="text-xl font-bold text-purple-400 mb-2">Scope 3</h2>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">Value Chain (Optional)</p>
            <div className="text-3xl font-bold text-white mb-1">{s3.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <p className="text-xs text-gray-500">kgCO2e</p>
            <div className="mt-6 text-purple-400 text-sm font-bold group-hover:translate-x-2 transition-transform">Edit Data ➔</div>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center border-t border-gray-800 pt-12">
          <Link href="/dashboard/review" className="bg-white text-black font-extrabold py-4 px-16 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Proceed to Review & Sign ➔
          </Link>
        </div>
      </main>
    </div>
  );
}   