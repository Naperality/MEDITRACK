'use client';
import Link from "next/link";
import Navbar from "@/components/Navbar"; // Make sure to create this component!
import { Pill, FileText, Users, Calendar, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffcfc] text-slate-800 antialiased overflow-x-hidden">
      
      {/* Navbar Component */}
      <Navbar />

      {/* Main Container - Scaled back up to your original spacious widths */}
      <main className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto z-10">
        
        {/* Ambient background glows from your original file */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-5%] left-[5%] w-[60%] h-[60%] rounded-full bg-rose-200 blur-[120px]" />
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[50%] rounded-full bg-pink-100 blur-[100px]" />
        </div>

        {/* Header Hero Section - Restored big typography */}
        <div id="home" className="text-center max-w-4xl mx-auto mb-16 sm:mb-24">
          {/* Pulsing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] text-rose-600 uppercase bg-rose-50 border border-rose-100 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Smart Health Management
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold text-slate-900 mb-8 leading-[1.1] tracking-tight text-balance">
            <span className="font-extrabold">MediNow:</span> Effortless Medication <br /> 
            <span className="text-rose-600 font-light italic">Management & Care</span>
          </h2>
          
          <p className="text-base sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            A smart companion for patients and caregivers to track doses, set reminders, and ensure health together.
          </p>
        </div>

        {/* 2-Column Split Layout matching the image breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* LEFT COLUMN: Phone Mockups Visual Block */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[400px] sm:min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200/40 to-rose-200/30 rounded-full filter blur-3xl -z-10 transform scale-95" />
            
            {/* Floating Details */}
            <div className="absolute top-4 left-10 text-rose-300 animate-bounce duration-1000"><Pill className="w-6 h-6 rotate-45" /></div>
            <div className="absolute bottom-12 right-6 text-rose-300 opacity-80"><Pill className="w-5 h-5 -rotate-12" /></div>
            <div className="absolute top-1/2 right-2 text-rose-400/60 text-xl">❤️</div>
            <div className="absolute bottom-8 left-4 text-rose-400/40 text-2xl">❤️</div>

            {/* Mockup Stack */}
            <div className="relative w-full max-w-[400px] h-[380px] sm:h-[450px]">
              <div className="absolute left-0 top-12 w-[160px] h-[320px] bg-white rounded-[2rem] shadow-xl border border-rose-100 p-2 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                <div className="w-full h-full bg-rose-50/40 rounded-[1.7rem] border border-dashed border-rose-200/50 flex items-center justify-center text-xs text-rose-400 font-medium">Upcoming Doses</div>
              </div>
              
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[190px] h-[370px] bg-white rounded-[2.2rem] shadow-2xl border-2 border-rose-100 p-2 z-10 transform scale-105">
                <div className="w-full h-full bg-rose-50/40 rounded-[1.8rem] border border-dashed border-rose-200/50 flex items-center justify-center text-xs text-rose-400 font-medium">Patient Profile</div>
              </div>

              <div className="absolute right-0 top-16 w-[160px] h-[300px] bg-white rounded-[1.8rem] shadow-lg border border-rose-100 p-2 transform rotate-6 transition-transform hover:rotate-0 duration-300">
                <div className="w-full h-full bg-rose-50/40 rounded-[1.5rem] border border-dashed border-rose-200/50 flex items-center justify-center text-xs text-rose-400 font-medium">Caregiver Dashboard</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Large 2x2 Feature Grid Layout */}
          <div id="features" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<FileText className="w-6 h-6 sm:w-7 h-7 text-amber-500" />}
              iconBg="bg-amber-50"
              title="Comprehensive Management" 
              desc="Easy input of medications, dosages, types, times, and schedules." 
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 sm:w-7 h-7 text-rose-400" />}
              iconBg="bg-rose-50"
              title="Dual-User Access" 
              desc="Secure access for both users to coordinate care in real-time." 
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 sm:w-7 h-7 text-emerald-500" />}
              iconBg="bg-emerald-50"
              title="Adherence Tracking" 
              desc="Monitor intake history and track adherence effectively." 
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 sm:w-7 h-7 text-slate-600" />}
              iconBg="bg-slate-100"
              title="Smart Reminders" 
              desc="Automated alerts to never miss a dose." 
            />
          </div>

        </div>

        {/* Centered Action Button Block from your original code */}
        <div id="download" className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            href="/register" 
            className="group w-full sm:w-auto bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95 text-base"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Simplified Footer matching layout bounds */}
      <footer id="about" className="max-w-7xl mx-auto py-12 px-6 border-t border-slate-100 text-center">
         <p className="text-slate-400 text-xs tracking-widest uppercase italic">
            “The greatest wealth is health.” — MediNow PH
         </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, desc }: { icon: React.ReactNode; iconBg: string; title: string; desc: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-rose-200 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(225,29,72,0.08)] group flex flex-col items-center text-center">
      <div className={`mb-6 p-4 ${iconBg} rounded-2xl w-fit`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-3 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm font-light">{desc}</p>
    </div>
  );
}