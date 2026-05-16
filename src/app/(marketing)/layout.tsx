'use client';
import Navbar from "@/components/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Layer 1: Pinned Navigation Overlay (Only renders inside this group) */}
      <div className="fixed top-0 inset-x-0 z-[9999] pointer-events-none p-4 sm:p-6">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {/* Layer 2: Home/Landing Page content flow */}
      <div className="relative z-10">
        {children}
      </div>
    </>
  );
}