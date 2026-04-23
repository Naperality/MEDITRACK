import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If user is logged in, you might want to redirect them to a generic dashboard loader
  // but for now, let's just keep the landing page accessible.

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">MediTrack</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold text-slate-900 mb-6">
          Never miss a dose again.
        </h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          The simple, collaborative medication tracker for patients and caregivers. 
          Manage schedules, track intake, and stay healthy together.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <FeatureCard title="For Patients" desc="View your daily meds and mark them as taken with one tap." />
          <FeatureCard title="For Caregivers" desc="Monitor your loved ones and get peace of mind." />
          <FeatureCard title="For Admins" desc="Securely manage roles and system access." />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}