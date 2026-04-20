'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F5F5F7]">
      <SignUp 
        path="/sign-up" 
        routing="path" 
        forceRedirectUrl="/onboarding"
      />
    </div>
  );
}