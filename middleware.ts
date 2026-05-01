import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Public Routes (No login required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks/clerk'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 2. SMART REDIRECT: If user is logged in and tries to access public auth pages (/, /login, /register)
  if (userId && isPublicRoute(req)) {
    // We cast this to help TypeScript understand the shape of your metadata
    const role = sessionClaims?.metadata?.requested_role;

    // Check specific roles and redirect
    if (role === 'CAREGIVER') {
      return NextResponse.redirect(new URL('/caregiver-dashboard', req.url));
    } 
    
    if (role === 'PATIENT') {
      return NextResponse.redirect(new URL('/patient-dashboard', req.url));
    } 
    
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin-dashboard', req.url));
    }
    
    // Fallback: If they are logged in but role isn't in metadata yet, 
    // send them to the main dashboard logic page.
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. PROTECTION: If the route is NOT public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};