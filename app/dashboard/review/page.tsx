'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function ReviewPage() {
  const router = useRouter();
  const { data, setData } = useESG();

  // --- Quick Math for Summary ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1, diesel: 3.16, petrol: 2.8, r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, districtHeat: 0.170, vehicleKm: 0.218, flightKm: 0.14, hotelNights: 6.9
  };
  const s1 = (data.gas * FACTORS.gas) + (data.heatingOil * FACTORS.heatingOil) + (data.propane * FACTORS.propane) +
             (data.diesel * FACTORS.diesel) + (data.petrol * FACTORS.petrol) +
             (data.r410a * FACTORS.r410a) + (data.r32 * FACTORS.r32) + (data.r134a * FACTORS.r134a);
  const s2 = (data.elec * FACTORS.elec) + (data.districtHeat * FACTORS.districtHeat);
  const s3 = (data.vehicleKm * FACTORS.vehicleKm) + (data.flightKm * FACTORS.flightKm) + (data.hotelNights * FACTORS.hotelNights);
  const total = s1 + s2 + s3;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setData({ ...data, files: [...data.files, ...newFiles] });
    }
  };

  const handleFinalSubmit = () => {
    // 1. Check Profile Data
    if (!data.companyName || !data.revenue) {
      alert("Profile Incomplete! You must provide Company Name and Revenue to generate a valid report.");
      router.push('/dashboard/profile');
      return;
    }

    // 2. Check Signature
    if(!data.signerName) {
      alert("Please sign the report before generating.");
      return;
    }
    
    // 3. Go to Results
    router.push('/dashboard/results');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-3xl mx-auto mb-8 border-b border-gray-800 pb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mt-2">Final Review & Evidence</h1>
      </nav>

      <main className="max-w-3xl mx-auto space-y-8">
        
        {/* 1. Summary Card */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Carbon Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">
                {s1.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-xs text-gray-500">Scope 1</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {s2.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-xs text-gray-500">Scope 2</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {s3.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-xs text-gray-500">Scope 3</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Total Footprint</span>
            <span className="text-2xl font-bold text-white">
              {total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm text-gray-500">kgCO2e</span>
            </span>
          </div>
        </section>

        {/* 2. File Upload */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Evidence Upload</h3>
          <p className="text-sm text-gray-500 mb-4">Please upload invoices or logs that support the numbers above.</p>
          
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer relative">
            <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p className="text-gray-300 font-medium">Click to attach files</p>
            <p className="text-xs text-gray-600 mt-2">PDF, JPG, PNG supported</p>
          </div>
          
          {data.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                  <span>✓</span> {f}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Signature */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Attestation</h3>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Authorized Signer Name</label>
                <input type="text" required value={data.signerName} onChange={(e) => setData({...data, signerName: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none" placeholder="Enter Full Legal Name" />
              </div>
              <p className="text-xs text-gray-600 italic">By clicking "Create Report", I certify that the data provided is accurate to the best of my knowledge.</p>
          </div>
        </section>

        <button onClick={handleFinalSubmit} className="w-full bg-white text-black font-extrabold py-4 rounded-xl hover:scale-[1.02] transition-transform">
          Create Report ➔
        </button>

      </main>
    </div>
  );
}