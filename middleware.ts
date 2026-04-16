import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding',
  '/privacy',
  '/terms',
  '/methodology',
  '/framework',
  '/alignment',
]);

// Supplier-only routes
const isSupplierRoute = createRouteMatcher(['/supplier(.*)']);

// Buyer-only routes
const isBuyerRoute = createRouteMatcher(['/buyer(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes through
  if (isPublicRoute(req)) return NextResponse.next();

  // Protect all non-public routes — redirects to sign-in if not logged in
  const { userId, getToken } = await auth.protect();

  // Skip role check for onboarding
  if (req.nextUrl.pathname === '/onboarding') return NextResponse.next();

  try {
    const token = await getToken({ template: 'supabase' });
    if (!token) return NextResponse.next();

    // Fetch role directly via Supabase REST API — no SDK needed in Edge runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    const rows = await res.json();
    const role = rows?.[0]?.role;

    // No role set yet → send to onboarding
    if (!role) {
      if (req.nextUrl.pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
      return NextResponse.next();
    }

    // Buyer trying to access supplier routes → redirect to buyer dashboard
    if (role === 'buyer' && isSupplierRoute(req)) {
      return NextResponse.redirect(new URL('/buyer/dashboard', req.url));
    }

    // Supplier trying to access buyer routes → redirect to supplier portal
    if (role === 'supplier' && isBuyerRoute(req)) {
      return NextResponse.redirect(new URL('/supplier/dashboard', req.url));
    }

  } catch (err) {
    // If role check fails, let them through — better than blocking
    console.error('Middleware role check error:', err);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};