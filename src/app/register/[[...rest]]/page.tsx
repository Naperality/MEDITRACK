import { SignUp } from "@clerk/nextjs";
import { CheckCircle2, Users, HeartPulse } from "lucide-react";
import { clerkTheme } from "@/lib/clerk-theme";

export default function RegisterPage() {
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

      {/* Right Side: Clerk Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md py-12">
          <SignUp 
            routing="path" 
            path="/register" 
            unsafeMetadata={{
              requested_role: "PATIENT" 
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