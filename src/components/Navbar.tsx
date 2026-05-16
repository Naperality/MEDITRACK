'use client';
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="max-w-4xl mx-auto my-4 sm:my-6 px-6 py-3 flex justify-between items-center bg-white/70 backdrop-blur-md border border-rose-100 rounded-full shadow-sm relative z-20">
      {/* Brand Logo */}
      <div className="flex items-center">
        <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent tracking-tight">
          MediNow
        </span>
      </div>
      
      {/* Centered Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="#home" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
          Home
        </Link>
        <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors">
          Features
        </Link>
        <Link href="#download" className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors">
          Download
        </Link>
        <Link href="#about" className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors">
          About
        </Link>
      </div>

      {/* Action Button */}
      <div>
        <Link 
          href="/register" 
          className="bg-rose-100 hover:bg-rose-200 text-rose-600 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}