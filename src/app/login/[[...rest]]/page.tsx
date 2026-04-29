import { SignIn } from "@clerk/nextjs";
import { Pill, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clerkTheme } from "@/lib/clerk-theme";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Left Side: Brand Identity */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-md relative z-10">
          <div className="bg-white p-3 rounded-2xl mb-8 w-fit shadow-xl shadow-blue-800/20">
            <Pill className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Secure Access to Your <br />Health Dashboard.
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <p className="font-medium">Encrypted medical data storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Clerk Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <SignIn 
            signUpUrl="/register" 
            forceRedirectUrl="/sync-user" // Redirect to a loading/sync page first
            appearance={clerkTheme}
          />
        </div>
      </div>
    </div>
  );
}