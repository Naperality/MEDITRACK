'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Pill, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  Heart, 
  Activity 
} from "lucide-react";

export default function Home() {
  // PWA Installation state management
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] text-slate-800 antialiased overflow-x-hidden scroll-smooth">

      {/* Main Container */}
      <main className="relative pt-28 pb-24 px-6 max-w-7xl mx-auto z-10">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-5%] left-[5%] w-[60%] h-[60%] rounded-full bg-rose-200 blur-[120px]" />
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[50%] rounded-full bg-pink-100 blur-[100px]" />
        </div>

        {/* =========================================================================
            HEADER HERO SECTION: Professionalized, high-tier healthcare positioning
           ========================================================================= */}
        <div id="home" className="text-center max-w-4xl mx-auto mb-16 sm:mb-24 pt-6 scroll-mt-24">
          {/* Pulsing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] text-rose-600 uppercase bg-rose-50 border border-rose-100 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Clinical-Grade Medication Tracking
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold text-slate-900 mb-8 leading-[1.1] tracking-tight text-balance">
            <span className="font-extrabold text-slate-900">MediNow:</span> Precision Medication <br /> 
            <span className="text-rose-600 font-light italic">Adherence Platform</span>
          </h2>
          
          <p className="text-base sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Bridging the gap between medical prescriptions and daily execution. A collaborative system engineered for patients and care providers to safeguard medication compliance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="group w-full sm:w-auto bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto bg-white border border-rose-100 hover:border-rose-200 text-rose-600 px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm"
              >
                <Download className="w-4 h-4" />
                Install Mobile App
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          
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

          {/* RIGHT COLUMN: Feature Grid Layout with offset scrolling hooks */}
          <div id="features" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 scroll-mt-24">
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

        {/* =========================================================================
            ABOUT SECTION: Deep details into application logic and ecosystem operation
           ========================================================================= */}
        <div id="about" className="scroll-mt-24 mb-28 border-t border-rose-100/60 pt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              How MediNow Works
            </h3>
            <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
              Designed as an interconnected Progressive Web Application (PWA) to serve as a real-time safety bridge between independent patient care and direct caregiver oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl w-fit mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">1. Synchronized Schedules</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                Patients easily map complex multi-drug schedules. The backend processes exact dosage timestamps, drug variants, and critical intervals to avoid drug interaction conflicts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">2. Active Caregiver Circles</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                By pairing accounts via secure credentials, family members or caregivers gain a dedicated diagnostic portal. They monitor live intake trends without intruding on patient independence.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl w-fit mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">3. Fail-Safe Verification</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                When an entry is updated or marked as consumed on the mobile device layer, data syncs immediately. If a window is missed, alerts flag the caregiver panel to prevent accidental double-dosing.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DOWNLOAD SECTION: Responsive native PWA Installation prompt card
           ========================================================================= */}
        <div id="download" className="scroll-mt-24 mb-16">
          <div className="bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-600 text-white rounded-[2.5rem] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl shadow-rose-200 relative overflow-hidden">
            {/* Soft decorative visual structures inside banner */}
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-black/10 blur-2xl pointer-events-none" />

            <Smartphone className="w-12 h-12 mx-auto mb-6 opacity-90 animate-pulse" />
            
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 tracking-tight">
              Install MediNow on Your Device
            </h3>
            
            <p className="text-rose-100 max-w-xl mx-auto mb-8 font-light text-sm sm:text-base leading-relaxed">
              MediNow is fully cross-platform. Save it directly onto your iOS, Android, or desktop screen straight through your web browser layout engine for low-latency offline tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              {isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-white text-rose-600 font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-rose-50 transition-all active:scale-95 text-base"
                >
                  <Download className="w-5 h-5" />
                  Install Application
                </button>
              ) : isInstalled ? (
                <div className="w-full bg-rose-700/40 border border-rose-400/30 text-white font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm">
                  <ShieldCheck className="w-5 h-5 text-rose-200" />
                  Running Native PWA System Version
                </div>
              ) : (
                <div className="w-full bg-rose-700/30 border border-rose-400/20 text-white/90 font-light px-6 py-4 rounded-2xl text-xs sm:text-sm leading-relaxed">
                  💡 <strong>To install manually:</strong> Tap your browser's menu option button (or sharing arrow icon on iOS Safari) and choose <strong>“Add to Home Screen”</strong>.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="max-w-7xl mx-auto py-12 px-6 border-t border-slate-100 text-center">
        <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4 font-medium">
          <span className="hover:text-rose-500 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-rose-500 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-rose-500 transition-colors cursor-pointer">Contact Support</span>
        </div>
        <p className="text-slate-400 text-[11px] tracking-widest uppercase italic">
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