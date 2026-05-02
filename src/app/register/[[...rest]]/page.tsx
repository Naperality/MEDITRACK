"use client"; // Required for state management

import { SignUp } from "@clerk/nextjs";
import { Users, HeartPulse, UserCircle, Pill, ArrowLeft, CheckCircle2 } from "lucide-react";
import { clerkTheme } from "@/lib/clerk-theme";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  // State to track the selected role
  const [role, setRole] = useState<"PATIENT" | "CAREGIVER">("PATIENT");

  return (
    <div className="flex min-h-screen bg-[#fffcfc]">
      {/* Back to Home Button - Responsive positioning */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-10 sm:left-10 flex items-center gap-2 text-slate-400 hover:text-rose-600 transition-all duration-300 font-medium z-20 group"
      >
        <div className="p-2 rounded-full group-hover:bg-rose-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-xs sm:text-sm tracking-wide uppercase">Back</span>
      </Link>

      {/* Left Side: Sleek Branding Side - Hidden on Mobile */}
      <div className="hidden lg:flex w-[45%] bg-slate-900 items-center justify-center p-16 relative overflow-hidden">
        {/* Animated Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-rose-600/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/20 blur-[100px]" />
        </div>

        <div className="max-w-sm relative z-10">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2.5 rounded-xl shadow-lg shadow-rose-500/20">
              <Pill className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">MediTrack</span>
          </div>

          <h2 className="text-4xl font-semibold text-white mb-8 leading-[1.2] tracking-tight text-balance">
            Start your journey <br />
            to <span className="text-rose-400 font-light italic">better health</span> <br />
            management.
          </h2>
          
          <div className="space-y-8 border-l border-white/10 pl-6">
            <FeatureItem 
              icon={<HeartPulse className="text-rose-500" />}
              title="Patient-First Design"
              desc="Intuitive interfaces tailored for ease of use and clarity."
            />
            <FeatureItem 
              icon={<Users className="text-pink-400" />}
              title="Collaborative Sync"
              desc="Stay connected with caregivers through real-time updates."
            />
          </div>

          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              Philippines' Premier Health Companion
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Role Selection + Clerk - Full Width on Mobile */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-8 bg-white relative">
        {/* Mobile-only Logo (Visible only when sidebar is hidden) */}
        <div className="lg:hidden flex items-center gap-2 mb-8 mt-12">
            <div className="bg-rose-600 p-1.5 rounded-lg shadow-md">
              <Pill className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">MediTrack</span>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-50/20 blur-[80px] sm:blur-[100px] -z-10" />

        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-0">
          <div className="mb-8 sm:mb-10 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 text-sm mt-2">Choose your primary role to customize your experience.</p>
          </div>
          
          {/* Role Selection UI - Sleek Rounded Design, optimized for touch */}
          <div className="mb-8 p-1.5 bg-slate-100 rounded-2xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setRole("PATIENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl transition-all duration-300 active:scale-95 ${
                role === "PATIENT" 
                ? "bg-white shadow-md text-rose-600 scale-[1.02]" 
                : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCircle size={18} className="sm:w-5 sm:h-5" />
              <span className="font-bold text-xs sm:text-sm">Patient</span>
            </button>
            <button
              onClick={() => setRole("CAREGIVER")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl transition-all duration-300 active:scale-95 ${
                role === "CAREGIVER" 
                ? "bg-white shadow-md text-rose-600 scale-[1.02]" 
                : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              <span className="font-bold text-xs sm:text-sm">Caregiver</span>
            </button>
          </div>

          <div className="clerk-auth-wrapper shadow-[0_20px_50px_rgba(225,29,72,0.05)] rounded-2xl overflow-hidden">
            <SignUp 
              routing="path" 
              path="/register" 
              unsafeMetadata={{
                requested_role: role 
              }}
              appearance={clerkTheme}
            />
          </div>

          <p className="mt-8 text-center text-slate-400 text-[10px] sm:text-[11px] tracking-wide px-4">
            BY JOINING, YOU AGREE TO OUR TERMS OF SERVICE AND PRIVACY POLICY.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="bg-white/5 p-2 rounded-lg h-fit border border-white/5">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-medium text-base">{title}</h4>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}