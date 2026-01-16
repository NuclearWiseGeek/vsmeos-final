'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // To get data from the previous page
import { jsPDF } from 'jspdf';
import { 
  Download, 
  FileText, 
  ChevronLeft, 
  User, 
  CheckCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const ResultsPage = () => {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Get the analysis data (or use a placeholder if testing directly)
  // In your flow, this probably comes from the URL or a global state. 
  // I've added a fallback text so you can see it working right now.
  const analysisTitle = searchParams.get('title') || "Sustainability Analysis Report";
  const analysisContent = searchParams.get('analysis') || 
    "Based on the inputs provided, the company shows a strong alignment with ESG metrics. " +
    "The carbon footprint has been reduced by 15% compared to the industry average. " +
    "However, governance scores indicate a need for more transparent board structures.\n\n" +
    "Recommendation: Invest in renewable energy credits and update corporate bylaws.";

  // 2. The PDF Generation Logic
  const handleDownload = () => {
    if (!userName.trim()) {
      alert("Please enter your name to sign the report.");
      return;
    }

    setIsDownloading(true);
    const doc = new jsPDF();
    
    // -- PDF Design --
    // Header
    doc.setFillColor(30, 41, 59); // Slate-900 (Dark Blue)
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("NexusAI Report", 20, 25);
    
    // Content
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.text(analysisTitle, 20, 60);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    
    // Wrap text to fit page
    const splitText = doc.splitTextToSize(analysisContent, 170);
    doc.text(splitText, 20, 75);
    
    // Footer / Signature
    const finalY = 75 + (splitText.length * 7);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY + 20, 100, finalY + 20); // Signature line
    doc.text(`Prepared By: ${userName}`, 20, finalY + 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, finalY + 38);

    // Save
    doc.save('NexusAI-Report.pdf');
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <span>Report Generator</span>
          </div>
        </div>
        <div className="text-sm text-slate-500">
           Status: <span className="text-emerald-600 font-medium flex items-center gap-1 inline-flex"><CheckCircle size={12}/> Ready</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: The Report Preview (Paper Look) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Review Analysis</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-10 relative overflow-hidden">
              {/* Decorative top bar on the paper */}
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{analysisTitle}</h1>
                <p className="text-slate-400 text-sm uppercase tracking-wider">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {analysisContent}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Prepared By</p>
                  <p className="font-handwriting text-2xl text-indigo-900 font-medium">
                    {userName || <span className="text-slate-200 italic">Sign on the right →</span>}
                  </p>
                </div>
                <div className="w-16 h-16 opacity-10">
                  <Zap size={64} className="text-slate-900" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-indigo-600" />
                Finalize Report
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Prepared By (Name)</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800 leading-relaxed">
                  <span className="font-semibold">Note:</span> Signing this document certifies that the AI-generated analysis has been reviewed for accuracy.
                </div>

                <button 
                  onClick={handleDownload}
                  disabled={!userName || isDownloading}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-md
                    ${!userName 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-900/20 active:transform active:scale-[0.98]'
                    }
                  `}
                >
                  {isDownloading ? (
                    <span className="animate-pulse">Generating PDF...</span>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions / Help */}
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-lg">
              <h4 className="text-white font-medium mb-2">Need changes?</h4>
              <p className="text-sm opacity-80 mb-4">You can regenerate this analysis with different parameters if the results are not satisfactory.</p>
              <Link href="/dashboard" className="block w-full py-2 text-center border border-slate-600 hover:bg-slate-800 text-white rounded-lg text-sm transition-colors">
                Start Over
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultsPage;