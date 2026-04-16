'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignUp 
        path="/sign-up" 
        routing="path" 
        forceRedirectUrl="/supplier/dashboard"
      />
    </div>
  );
}