import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <main className="text-center max-w-2xl">
        {/* Logo or Brand Name */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          VSMEOS
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-400 mb-8">
          Simplifying Financial Management for French SMEs
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-block border border-gray-700 bg-gray-900 rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 mb-10">
          Coming Soon
        </div>

        {/* Call to Action (Waitlist) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
          <button className="px-6 py-3 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition-colors">
            Notify Me
          </button>
        </div>
      </main>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        © 2026 VSMEOS. All rights reserved.
      </footer>
    </div>
  );
}