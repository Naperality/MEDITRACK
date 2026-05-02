import { SignIn } from "@clerk/nextjs";
import { Pill, ShieldCheck, ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { clerkTheme } from "@/lib/clerk-theme";

export default function LoginPage() {
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

      {/* Left Side: Professional Branding Side - Hidden on Mobile */}
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

          <h2 className="text-4xl font-semibold text-white mb-8 leading-[1.2] tracking-tight">
            Streamlined health <br />
            <span className="text-rose-400 font-light italic">management</span> for <br />
            modern care.
          </h2>

          <div className="space-y-6 border-l border-white/10 pl-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-rose-500 mt-1" />
              <div>
                <p className="text-white font-medium text-sm">Real-time Verification</p>
                <p className="text-slate-400 text-xs mt-1">Instant updates between patients and providers.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-rose-500 mt-1" />
              <div>
                <p className="text-white font-medium text-sm">Enterprise Security</p>
                <p className="text-slate-400 text-xs mt-1">Your health data is encrypted and private.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              Trusted by healthcare providers in PH
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Clerk Component - Full Width on Mobile */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-8 relative">
        {/* Mobile-only Logo (Visible when sidebar is hidden) */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-10 mt-12">
            <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-500/20">
              <Pill className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediTrack</h1>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-50/20 blur-[80px] sm:blur-[100px] -z-10" />
        
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-0">
          <div className="text-center mb-10 lg:hidden">
            <p className="text-slate-500 text-sm">Sign in to manage your health schedule</p>
          </div>
          
          <div className="clerk-auth-wrapper shadow-[0_20px_50px_rgba(225,29,72,0.05)] rounded-2xl overflow-hidden">
            <SignIn 
              signUpUrl="/register" 
              forceRedirectUrl="/dashboard"
              appearance={clerkTheme}
            />
          </div>
          
          <footer className="mt-8 text-center">
            <p className="text-slate-400 text-[10px] sm:text-xs tracking-wide">
              © 2026 MEDITRACK HEALTH. ALL RIGHTS RESERVED.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}