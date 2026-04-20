'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F5F5F7]">
      <SignIn 
        path="/sign-in" 
        routing="path" 
        forceRedirectUrl="/supplier/dashboard"
      />
    </div>
  );
}