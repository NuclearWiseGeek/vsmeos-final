'use client';

import React, { useState, useRef } from 'react';
import { uploadSupplierCSV } from '@/actions/buyer';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CSVUploader() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadSupplierCSV(formData);
    
    if (result.success) {
      alert(`Success! Invited ${result.count} suppliers.`);
      router.refresh(); 
    } else {
      alert('Error: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 bg-[#0C2918] hover:bg-[#122F1E] text-[#C9A84C] px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
        <span>{loading ? 'Uploading...' : 'Upload CSV'}</span>
      </button>
    </div>
  );
}