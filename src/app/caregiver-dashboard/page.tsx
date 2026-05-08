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

  // 1. FETCH: Retrieve links and nested data
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

  // 2. FETCH LOGS
  const { data: allLogs } = await supabaseAdmin
    .from('medication_logs')
    .select('*')
    .in('patient_id', patientIds)
    .order('logged_at', { ascending: false });

  if (error) console.error("Supabase Fetch Error:", error.message);

  // Filter patients based on search query
  const filteredLinks = links?.filter((link: any) => {
    const name = (Array.isArray(link.profiles) ? link.profiles[0] : link.profiles)?.full_name || "";
    return name.toLowerCase().includes(searchQuery);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <SyncTrigger isCaregiver />

      {/* Top Header Section */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Caregiver Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">MediNow PH</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-50 p-1 rounded-full border border-slate-100">
               <UserButton />
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        
        {/* Link Patient Action Area */}
        <section className="mb-12">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl shadow-slate-200">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-0" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Add Patient to Monitor</h2>
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
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter patient's email address..."
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20 whitespace-nowrap">
                  Start Monitoring
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Dashboard Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h2>
            <p className="text-slate-500 text-sm">Managing {links?.length || 0} active patient profiles</p>
          </div>
          
          <div className="w-full md:w-80">
            <SearchBar />
          </div>
        </div>

        {/* Expandable Patient List */}
        <div className="space-y-4">
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

          {(!filteredLinks || filteredLinks.length === 0) && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
               <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-800">No patients found</h3>
               <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">
                 Try a different search or link a new patient using their email address above.
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}