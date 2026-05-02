'use client';
import Link from "next/link";
import { Pill, Users, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffcfc] overflow-x-hidden">
      {/* Sleek Navbar */}
      <nav className="max-w-7xl mx-auto p-6 sm:p-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl shadow-lg shadow-rose-500/20">
            <Pill className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediTrack</h1>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider">
            Login
          </Link>
          <Link href="/register" className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 hover:shadow-rose-200 hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative pt-12 pb-24 px-6">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[60%] rounded-full bg-rose-200 blur-[120px]" />
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[50%] rounded-full bg-pink-100 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] text-rose-600 uppercase bg-rose-50 border border-rose-100 rounded-full animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Smart Health Management
          </div>
          
          <h2 className="text-5xl sm:text-7xl font-semibold text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Keep your health <br />
            <span className="text-rose-600 font-light italic">on schedule.</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            The collaborative medication tracker designed for clarity and peace of mind. 
            Bridging the gap between patients and caregivers in the Philippines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
             <Link href="/register" className="group bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200">
               Create Free Account
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left relative z-10">
            <FeatureCard 
              icon={<Heart className="w-6 h-6 text-rose-500" />}
              title="For Patients" 
              desc="Simple checklists and smart reminders to keep your daily intake consistent without the stress." 
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-pink-500" />}
              title="For Caregivers" 
              desc="Real-time monitoring and verification of doses taken, providing true peace of mind from anywhere." 
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-slate-700" />}
              title="For Admins" 
              desc="Enterprise-grade security to manage roles and sensitive health data with full compliance." 
            />
          </div>
        </div>
      </main>

      {/* Subtle Footer Quote */}
      <footer className="max-w-5xl mx-auto py-12 px-6 border-t border-slate-100 text-center">
         <p className="text-slate-400 text-xs tracking-widest uppercase italic">
           “The greatest wealth is health.” — MediTrack PH
         </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-rose-200 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(225,29,72,0.1)] group">
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-rose-50 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-4 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm font-light">{desc}</p>
    </div>
  );
}