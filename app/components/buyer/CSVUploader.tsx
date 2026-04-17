'use client';

// =============================================================================
// FILE: app/components/buyer/CSVUploader.tsx
// PURPOSE: CSV bulk import with Financial Year selector.
//
// CHANGE: Added Financial Year dropdown so every supplier imported from a CSV
//         is tagged with the reporting year. This year is sent in the invite
//         email link — the supplier sees it pre-filled and doesn't need to
//         enter it manually. Avoids human error when requesting data for a
//         specific CSRD reporting period.
//
// CSV FORMAT (unchanged): name,email — one supplier per row, header row skipped.
// =============================================================================

import React, { useState, useRef } from 'react';
import { uploadSupplierCSV } from '@/actions/buyer';
import { UploadCloud, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getYearOptions(): string[] {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2, current - 3].map(String);
}

export default function CSVUploader() {
  const [loading,       setLoading]       = useState(false);
  const [financialYear, setFinancialYear] = useState<string>(
    String(new Date().getFullYear() - 1)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router       = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('financialYear', financialYear);

    const result = await uploadSupplierCSV(formData);

    if (result.success) {
      alert(`Success! Added ${result.count} supplier${result.count === 1 ? '' : 's'} for FY ${financialYear}.`);
      router.refresh();
    } else {
      alert('Error: ' + result.error);
    }

    // Reset file input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(false);
  };

  const years = getYearOptions();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Year picker */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
        <select
          value={financialYear}
          onChange={e => setFinancialYear(e.target.value)}
          disabled={loading}
          className="text-sm text-gray-700 font-medium bg-transparent outline-none cursor-pointer pr-1"
          aria-label="Financial year for CSV import"
        >
          {years.map(y => (
            <option key={y} value={y}>FY {y}</option>
          ))}
        </select>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
        aria-label="Upload supplier CSV"
      />

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 bg-[#0C2918] hover:bg-[#122F1E] text-[#C9A84C] px-5 py-2 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
      >
        {loading
          ? <><Loader2 className="animate-spin" size={15} /> Importing…</>
          : <><UploadCloud size={15} /> Upload CSV</>
        }
      </button>

      {/* Format hint */}
      <p className="text-[10px] text-gray-400 w-full mt-0.5">
        CSV format: <span className="font-mono">name,email</span> — one supplier per row.
        All suppliers will be tagged as <span className="font-semibold">FY {financialYear}</span>.
      </p>
    </div>
  );
}