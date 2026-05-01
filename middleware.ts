import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which routes are "Protected" (require login)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',           // Ensure the redirector is protected
  '/patient-dashboard(.*)',
  '/caregiver-dashboard(.*)',
  '/admin-dashboard(.*)',
  '/sync-user(.*)',
]);

// 2. Define which routes are "Public"
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks/clerk'      // Allow Clerk to sync to Supabase via webhook
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is protected and user isn't logged in, redirect to login
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};