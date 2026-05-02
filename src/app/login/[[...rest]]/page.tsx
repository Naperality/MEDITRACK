import { SignIn } from "@clerk/nextjs";
import { Pill, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clerkTheme } from "@/lib/clerk-theme";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Back to Home Button - Themed with Rose hover */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Left Side: Brand Identity - Updated with Rose Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-600 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Circles matching the Register page */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-md relative z-10">
          <div className="bg-white p-3 rounded-2xl mb-8 w-fit shadow-xl shadow-rose-900/20">
            <Pill className="text-rose-600 w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Secure Access to Your <br />Health Dashboard.
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-100">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-rose-300" />
              </div>
              <p className="font-medium">Encrypted medical data storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Clerk Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-rose-50/30">
        <div className="w-full max-w-md">
          <SignIn 
            signUpUrl="/register" 
            forceRedirectUrl="/dashboard"
            appearance={clerkTheme}
          />
        </div>
      </div>
    </div>
  );
}