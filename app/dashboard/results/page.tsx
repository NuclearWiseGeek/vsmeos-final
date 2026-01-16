'use client';

import React from 'react';
import Link from 'next/link';
import { useESG } from '../../context/ESGContext';
import { generatePDF } from '../../utils/pdfGenerator'; // ✅ Import Matches File

export default function ResultsPage() {
  const { data, resetData } = useESG();

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-center">
      
      {/* Success Icon */}
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-900/50">
        <span className="text-5xl">🎉</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Assessment Complete!
      </h1>
      
      <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
        Your data has been successfully saved to our secure cloud. 
        You can now download your official Declaration of Conformity.
      </p>

      {/* Main Action Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-md mx-auto shadow-xl">
        <h3 className="text-white font-bold text-xl mb-2">Download Report</h3>
        <p className="text-gray-500 text-sm mb-8">PDF Format • ISO 14064-1 Aligned</p>
        
        <button 
          onClick={() => generatePDF(data)}
          className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 mb-4"
        >
          <span>📄</span> Download PDF
        </button>

        <Link 
          href="/dashboard"
          onClick={resetData}
          className="text-sm text-gray-500 hover:text-white underline"
        >
          Start New Assessment
        </Link>
      </div>

    </div>
  );
}