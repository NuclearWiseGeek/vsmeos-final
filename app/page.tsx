import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '@clerk/nextjs/server'; // <--- THIS IS THE FIX (added /server)
import { redirect } from 'next/navigation';

export default async function Home() { // <--- Added 'async' just to be safe for future-proofing
  const { userId } = await auth(); // <--- Added 'await' (best practice in new versions)

  // If user is already logged in, send them to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <div className="mx-auto h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck size={32} />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6">
          VSME <span className="text-gray-400">OS</span>
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          The Enterprise Operating System for Supplier ESG Compliance. 
          Generate audit-ready Scope 1, 2 & 3 reports in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
                <button className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition text-lg flex items-center gap-2">
                    Start Assessment <ArrowRight size={20} />
                </button>
            </Link>
            <Link href="/sign-in">
                <button className="bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-200 transition text-lg">
                    Sign In
                </button>
            </Link>
        </div>
        
        <p className="mt-12 text-sm text-gray-400">
            Compliant with CSRD ESRS E1 • GHG Protocol • ISO 14064-1
        </p>
      </div>
    </div>
  );
}