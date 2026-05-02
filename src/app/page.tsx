'use client';
import Link from "next/link";
import { Pill, Users, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50">
      {/* Responsive Navbar */}
      <nav className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Pill className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">MediTrack</h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
            Login
          </Link>
          <Link href="/register" className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-24 text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-100 rounded-full">
          Smart Health Management
        </span>
        
        {/* Responsive Typography: text-4xl on mobile, text-6xl on md+ */}
        <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 leading-[1.1]">
          Keep your health <br className="hidden sm:block" />
          <span className="text-emerald-600">on schedule.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          The collaborative medication tracker designed for clarity and peace of mind. 
          Bridging the gap between patients and caregivers in the Philippines.
        </p>
        
        {/* Grid: 1 column on mobile, 3 on medium screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Heart className="w-6 h-6 text-rose-500" />}
            title="For Patients" 
            desc="Simple checklists and push reminders to keep your daily intake consistent." 
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-emerald-600" />}
            title="For Caregivers" 
            desc="Real-time monitoring and verification of doses taken by your loved ones." 
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-teal-600" />}
            title="For Admins" 
            desc="Enterprise-grade security to manage roles and sensitive health data." 
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 sm:p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-2xl hover:-translate-y-1 group">
      <div className="mb-4 p-3 bg-white rounded-2xl w-fit shadow-sm border border-slate-100 group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}