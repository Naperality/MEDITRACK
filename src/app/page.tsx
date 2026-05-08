'use client';
import Link from "next/link";
import { Pill, Users, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffcfc] overflow-x-hidden">
      {/* Responsive Navbar - Fixed for Mobile visibility */}
      <nav className="max-w-7xl mx-auto p-4 sm:p-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-rose-500/20">
            <Pill className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">MediNow</h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-8">
          <Link 
            href="/login" 
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-slate-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-200 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6">
        {/* Background Decorative Elements - Scaled for mobile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] sm:h-[600px] -z-10 opacity-30">
          <div className="absolute top-[-5%] left-[5%] w-[60%] h-[60%] rounded-full bg-rose-200 blur-[80px] sm:blur-[120px]" />
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[50%] rounded-full bg-pink-100 blur-[60px] sm:blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge - Responsive text size */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 text-[9px] sm:text-[11px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-rose-600 uppercase bg-rose-50 border border-rose-100 rounded-full">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500"></span>
            </span>
            Smart Health Management
          </div>
          
          {/* Main Title - Uses 'text-balance' for better mobile wrapping */}
          <h2 className="text-4xl sm:text-7xl font-semibold text-slate-900 mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.1] tracking-tight text-balance">
            Keep your health <br />
            <span className="text-rose-600 font-light italic">on schedule.</span>
          </h2>
          
          <p className="text-base sm:text-xl text-slate-500 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-2 sm:px-0">
            The collaborative medication tracker designed for clarity and peace of mind. 
            Bridging the gap between patients and caregivers in the Philippines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20">
             <Link 
              href="/register" 
              className="group w-full sm:w-auto bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95"
            >
               Create Free Account
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
          
          {/* Feature Grid - Properly stacks on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left relative z-10">
            <FeatureCard 
              icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />}
              title="For Patients" 
              desc="Simple checklists and smart reminders to keep your daily intake consistent without the stress." 
            />
            <FeatureCard 
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />}
              title="For Caregivers" 
              desc="Real-time monitoring and verification of doses taken, providing true peace of mind from anywhere." 
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />}
              title="For Admins" 
              desc="Enterprise-grade security to manage roles and sensitive health data with full compliance." 
            />
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto py-8 sm:py-12 px-6 border-t border-slate-100 text-center">
         <p className="text-slate-400 text-[10px] sm:text-xs tracking-widest uppercase italic">
           “The greatest wealth is health.” — MediNow PH
         </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 sm:p-8 bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] hover:border-rose-200 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(225,29,72,0.1)] group">
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl w-fit group-hover:bg-rose-50 transition-all duration-500">
        {icon}
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-4 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm font-light">{desc}</p>
    </div>
  );
}