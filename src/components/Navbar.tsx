'use client';
import Link from "next/link";

export default function Navbar() {
  return (
      <nav className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center bg-white/80 backdrop-blur-md border border-rose-100 rounded-full shadow-sm pointer-events-auto">
        {/* Brand Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent tracking-tight">
            MediNow
          </span>
        </div>
        
        {/* Centered Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#home" className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors">
            Features
          </Link>
          <Link href="#download" className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors">
            Download
          </Link>
          <Link href="#about" className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors">
            About
          </Link>
        </div>

        {/* Action Buttons Right Wrapper */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link 
            href="/login" 
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-rose-100 hover:bg-rose-200 text-rose-600 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>
  );
}