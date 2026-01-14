import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-xl font-bold tracking-tighter">
          VSME <span className="text-blue-500">ESG OS</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Methodology</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">Log In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-900 bg-blue-900/20 text-blue-400 text-xs font-bold uppercase tracking-wide">
          v1.0 Public Beta Now Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          The Automated ESG Officer <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            for Modern Suppliers.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Generate compliant Carbon Footprint reports in minutes, not months. 
          Aligned with GHG Protocol, ISO 14064-1, and CSRD requirements.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard/profile" className="w-full md:w-auto bg-white text-black font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2">
            Start Free Assessment ➔
          </Link>
          <a href="#" className="w-full md:w-auto px-10 py-4 rounded-full border border-gray-800 hover:bg-gray-900 text-gray-300 font-medium transition-colors">
            View Sample Report
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 text-orange-500 text-xl">🔥</div>
            <h3 className="text-lg font-bold mb-2">Scope 1 & 2</h3>
            <p className="text-sm text-gray-400">Automated calculation of direct emissions and energy consumption using ADEME v23 factors.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500 text-xl">⚡</div>
            <h3 className="text-lg font-bold mb-2">Instant Audit Pack</h3>
            <p className="text-sm text-gray-400">Generate a professional 2-page PDF report with evidence tracking and attestation.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-500 text-xl">🔒</div>
            <h3 className="text-lg font-bold mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-400">Your data is stored locally in your browser. No external database tracking in this version.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
        <p>&copy; 2025 VSME Solutions. Built for the French Supply Chain.</p>
      </footer>
    </div>
  );
}