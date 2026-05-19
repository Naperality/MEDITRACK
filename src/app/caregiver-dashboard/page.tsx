export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import SyncTrigger from "@/components/SyncTrigger";
import PatientCard from "@/components/PatientCard"; // New Component for Expandable Logic
import SearchBar from "@/components/SearchBar"; // New Component for Search Logic

import { 
  UserPlus, Activity, Pill, LayoutGrid, Search
} from "lucide-react";

export default async function CaregiverDashboard({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const searchQuery = searchParams.q?.toLowerCase() || "";

  // 1. FETCH: Retrieve links and nested data (UNCHANGED)
  const { data: links, error } = await supabaseAdmin
    .from('caregiver_patient')
    .select(`
      patient_id,
      profiles:patient_id (
        full_name,
        medications (
          id, name, dosage, med_type, scheduled_times, patient_id, is_discontinued,
          daily_count, is_taken, last_taken_at, start_date, end_date
        )
      )
    `)
    .eq('caregiver_id', userId);

  const patientIds = links?.map(l => l.patient_id) || [];

  // 2. FETCH LOGS (UNCHANGED)
  const { data: allLogs } = await supabaseAdmin
    .from('medication_logs')
    .select('*')
    .in('patient_id', patientIds)
    .order('logged_at', { ascending: false });

  if (error) console.error("Supabase Fetch Error:", error.message);

  // Filter patients based on search query (UNCHANGED)
  const filteredLinks = links?.filter((link: any) => {
    const name = (Array.isArray(link.profiles) ? link.profiles[0] : link.profiles)?.full_name || "";
    return name.toLowerCase().includes(searchQuery);
  });

  return (
    <div className="min-h-screen bg-[#fffcfc] text-slate-800 antialiased overflow-x-hidden">
      <SyncTrigger isCaregiver />

      {/* Top Header Section */}
      <nav className="bg-white border-b border-rose-100/60 sticky top-0 z-30 shadow-[0_2px_20px_-10px_rgba(225,29,72,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2.5 rounded-2xl shadow-lg shadow-rose-200">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Caregiver Portal</h1>
              <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-[0.15em] mt-1.5">MediNow PH</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-rose-50/40 p-1 rounded-full border border-rose-100/40">
               <UserButton />
             </div>
          </div>
        </div>
      </nav>

      {/* Main Container Layer */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 relative">
        {/* Subtle ambient lighting design behind controls */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Link Patient Action Area */}
        <section className="mb-12">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl shadow-rose-950/5">
            {/* Background Decor matching design style */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-[80px] -z-0 pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-pink-500/5 rounded-full blur-[60px] -z-0 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5">
                  <UserPlus className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Add Patient to Monitor</h2>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Connect dashboards via registered email channel profiles</p>
                </div>
              </div>

              <form action={async (formData: FormData) => {
                'use server';
                const email = formData.get('email') as string;
                await linkPatient(userId, email);
              }} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input 
                    name="email" 
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-rose-500 outline-none transition-all duration-300 text-sm"
                    placeholder="Enter patient's email address..."
                  />
                </div>
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-rose-950/20 text-sm whitespace-nowrap">
                  Start Monitoring
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Dashboard Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-rose-100/30 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h2>
            <p className="text-slate-500 text-sm font-light mt-0.5">Managing {links?.length || 0} active patient medical records</p>
          </div>
          
          <div className="w-full md:w-80">
            <SearchBar />
          </div>
        </div>

        {/* Expandable Patient List */}
        <div className="space-y-5">
          {filteredLinks?.map((link: any) => {
            const profile = Array.isArray(link.profiles) ? link.profiles[0] : link.profiles;
            const patientLogs = allLogs?.filter(log => log.patient_id === link.patient_id) || [];

            return (
              <PatientCard 
                key={link.patient_id}
                profile={profile}
                patientId={link.patient_id}
                logs={patientLogs}
                caregiverId={userId}
              />
            );
          })}

          {/* Empty State Presentation Layer */}
          {(!filteredLinks || filteredLinks.length === 0) && (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-50/10 pointer-events-none" />
               <div className="bg-rose-50/60 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100/40">
                 <Search className="w-8 h-8 text-rose-400/80" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 tracking-tight">No patients found</h3>
               <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-light leading-relaxed">
                 Try a different search or link a new patient profile using their account email address above.
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}