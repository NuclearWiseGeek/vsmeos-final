import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ==========================================================================
  // All pages in this app use Clerk authentication (ClerkProvider wraps the
  // root layout). Static prerendering at build time fails because Clerk
  // requires CLERK_PUBLISHABLE_KEY at runtime. Disabling static generation
  // ensures all pages render at request time on Vercel / Node.
  // ==========================================================================
  output: undefined, // default — SSR, not static export

  // Turbopack resolves dynamic imports statically. resend v6 has an optional
  // dynamic import of @react-email/render (used only when rendering React
  // email templates). Tell webpack/turbopack to ignore this optional import
  // if the package isn't installed.
  serverExternalPackages: ['@react-email/render'],
};

export default nextConfig;