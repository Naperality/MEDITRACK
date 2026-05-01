"use client"; // Required for state management

import { SignUp } from "@clerk/nextjs";
import { Users, HeartPulse, UserCircle } from "lucide-react";
import { clerkTheme } from "@/lib/clerk-theme";
import { useState } from "react";

export default function RegisterPage() {
  // State to track the selected role
  const [role, setRole] = useState<"PATIENT" | "CAREGIVER">("PATIENT");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Information */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 items-center justify-center p-12 relative">
        <div className="max-w-md">
          <span className="text-blue-500 font-bold tracking-widest uppercase text-xs">Join MediTrack</span>
          <h2 className="text-4xl font-black text-white mt-4 mb-10 leading-tight">
            Caregiving made <br /><span className="text-blue-500">simpler.</span>
          </h2>
          
          <div className="space-y-8">
            <FeatureItem 
              icon={<HeartPulse className="text-pink-500" />}
              title="Patient-First Design"
              desc="Easy-to-tap interfaces designed for users of all ages."
            />
            <FeatureItem 
              icon={<Users className="text-blue-500" />}
              title="Collaborative Sync"
              desc="Caregivers get instant updates when a dose is marked taken."
            />
          </div>
        </div>
      </div>

      {/* Right Side: Role Selection + Clerk */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md py-6">
          
          {/* Role Selection UI */}
          <div className="mb-8 p-1 bg-slate-200 rounded-lg flex gap-1">
            <button
              onClick={() => setRole("PATIENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                role === "PATIENT" ? "bg-white shadow-sm text-blue-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCircle size={18} />
              <span className="font-semibold text-sm">Patient</span>
            </button>
            <button
              onClick={() => setRole("CAREGIVER")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                role === "CAREGIVER" ? "bg-white shadow-sm text-blue-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users size={18} />
              <span className="font-semibold text-sm">Caregiver</span>
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
      <div className="bg-white/10 p-3 rounded-xl h-fit">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-bold text-lg">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}