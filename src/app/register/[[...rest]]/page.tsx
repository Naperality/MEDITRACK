"use client"; // Required for state management

import { SignUp } from "@clerk/nextjs";
import { Users, HeartPulse, UserCircle, Pill } from "lucide-react";
import { clerkTheme } from "@/lib/clerk-theme";
import { useState } from "react";

export default function RegisterPage() {
  // State to track the selected role
  const [role, setRole] = useState<"PATIENT" | "CAREGIVER">("PATIENT");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Information - Now updated with Rose/Pink Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-600 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="max-w-md relative z-10">
          <div className="flex items-center gap-2 mb-8 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
            <Pill className="text-rose-100 w-5 h-5" />
            <span className="text-white font-bold tracking-widest uppercase text-xs">Join MediTrack</span>
          </div>
          
          <h2 className="text-4xl font-black text-white mb-10 leading-tight">
            Caregiving made <br />
            <span className="text-rose-200">simpler.</span>
          </h2>
          
          <div className="space-y-8">
            <FeatureItem 
              icon={<HeartPulse className="text-rose-400" />}
              title="Patient-First Design"
              desc="Easy-to-tap interfaces designed for users of all ages with a soothing palette."
            />
            <FeatureItem 
              icon={<Users className="text-pink-300" />}
              title="Collaborative Sync"
              desc="Caregivers get instant updates when a dose is marked taken."
            />
          </div>
        </div>
      </div>

      {/* Right Side: Role Selection + Clerk */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-rose-50/30">
        <div className="w-full max-w-md py-6">
          
          {/* Role Selection UI - Themed to Pink/Rose */}
          <div className="mb-8 p-1.5 bg-rose-100/50 backdrop-blur-sm rounded-xl flex gap-1 border border-rose-100">
            <button
              onClick={() => setRole("PATIENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                role === "PATIENT" 
                ? "bg-white shadow-md text-rose-600 scale-[1.02]" 
                : "text-slate-500 hover:text-rose-500"
              }`}
            >
              <UserCircle size={18} />
              <span className="font-bold text-sm">Patient</span>
            </button>
            <button
              onClick={() => setRole("CAREGIVER")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                role === "CAREGIVER" 
                ? "bg-white shadow-md text-rose-600 scale-[1.02]" 
                : "text-slate-500 hover:text-rose-500"
              }`}
            >
              <Users size={18} />
              <span className="font-bold text-sm">Caregiver</span>
            </button>
          </div>

          <SignUp 
            routing="path" 
            path="/register" 
            // The role state is now passed dynamically here
            unsafeMetadata={{
              requested_role: role 
            }}
            appearance={clerkTheme}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="bg-white/10 p-3 rounded-xl h-fit border border-white/10 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-bold text-lg">{title}</h4>
        <p className="text-rose-100/70 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}