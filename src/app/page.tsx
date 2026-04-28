import Link from "next/link";
import { Pill, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default async function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white">
      <nav className="max-w-7xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Pill className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MediTrack</h1>
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
          <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-blue-200">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full">
          Smart Health Management
        </span>
        <h2 className="text-6xl font-black text-slate-900 mb-6 leading-tight">
          Keep your health <br />
          <span className="text-blue-600">on schedule.</span>
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          The collaborative medication tracker designed for clarity and peace of mind. 
          Bridging the gap between patients and caregivers.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Pill className="w-6 h-6 text-blue-600" />}
            title="For Patients" 
            desc="Simple checklists and reminders to keep your daily intake consistent." 
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-teal-600" />}
            title="For Caregivers" 
            desc="Real-time monitoring and verification of doses taken by loved ones." 
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
            title="For Admins" 
            desc="Enterprise-grade security to manage roles and sensitive data." 
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl group">
      <div className="mb-4 p-3 bg-white rounded-2xl w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}