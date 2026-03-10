import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 🟢 DEFINE PUBLIC ROUTES
// We are making the root ('/') and auth pages public.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy',
  '/terms',
  '/methodology',
  '/framework',
  '/alignment',
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is NOT public, enforce protection
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};