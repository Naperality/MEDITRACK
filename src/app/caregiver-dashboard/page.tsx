// app/caregiver/page.tsx
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import AddMedicationForm from "@/components/AddMedicationForm";
import SyncTrigger from "@/components/SyncTrigger"; // Import the background trigger
import { 
  UserPlus, Activity, CheckCircle2, Clock, 
  History, Pill 
} from "lucide-react";

export default async function CaregiverDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. FETCH: Retrieve links and nested profile/medication data
  // We strictly READ here. No database updates.
  const { data: links, error } = await supabase
    .from('caregiver_patient')
    .select(`
      patient_id,
      profiles:patient_id (
        full_name,
        medications (
          id, name, dosage, med_type, scheduled_times, 
          daily_count, is_taken, last_taken_at, start_date, end_date
        )
      )
    `)
    .eq('caregiver_id', userId);

  const patientIds = links?.map(l => l.patient_id) || [];

  // 2. FETCH LOGS: Retrieve history for all linked patients
  const { data: allLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .in('patient_id', patientIds)
    .order('logged_at', { ascending: false });

  if (error) console.error("Supabase Fetch Error:", error.message);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* 
        This component triggers the missed dose sync for ALL 
        linked patients in the background after the page loads.
      */}
      <SyncTrigger isCaregiver />

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Caregiver Portal</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Real-time monitoring of patient adherence</p>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>

        {/* Section: Link Patient */}
        <section className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2rem] shadow-xl shadow-blue-100 text-white">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-xl font-bold">Link New Patient</h2>
          </div>
          <form action={async (formData: FormData) => {
            'use server';
            const email = formData.get('email') as string;
            await linkPatient(userId, email);
          }} className="flex flex-col sm:flex-row gap-3">
            <input 
              name="email" 
              type="email"
              autoComplete="email"
              className="flex-1 p-4 rounded-2xl border-none text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-white/20 outline-none"
              placeholder="Enter patient's exact email address..."
              required
            />
            <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
              Monitor Patient
            </button>
          </form>
        </section>

        <div className="space-y-12">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Active Patient Records
          </h2>
          
          {links?.map((link: any) => {
            const profile = Array.isArray(link.profiles) ? link.profiles[0] : link.profiles;
            const patientLogs = allLogs?.filter(log => log.patient_id === link.patient_id) || [];

            return (
              <div key={link.patient_id} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col lg:flex-row">
                
                {/* LEFT SIDE: Patient Info & Meds */}
                <div className="flex-1 p-8 lg:border-r border-slate-100">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                        {profile?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-slate-900">{profile?.full_name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {link.patient_id.slice(0,12)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-green-700 uppercase">Live Feed</span>
                    </div>
                  </div>

                  <div className="mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Prescribe Medication</h4>
                    <AddMedicationForm patientId={link.patient_id} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill className="w-4 h-4" /> Current Medications
                    </h4>
                    
                    {profile?.medications?.map((med: any) => (
                      <div key={med.id} className={`p-6 rounded-[2rem] border transition-all ${
                        med.is_taken ? 'bg-green-50/30 border-green-100' : 'bg-white border-slate-100 shadow-sm'
                      }`}>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-slate-800 text-lg">{med.name}</p>
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">
                                {med.med_type}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {med.scheduled_times?.map((t: string, i: number) => (
                                <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {med.is_taken ? (
                              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase">
                                <CheckCircle2 className="w-4 h-4" /> Taken
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase border border-amber-100">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT SIDE: Activity History */}
                <div className="w-full lg:w-80 bg-slate-50/50 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-blue-600" />
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">History</h4>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {patientLogs.map((log: any) => (
                      <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${log.status === 'MISSED' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-black text-slate-800">{log.med_name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            log.status === 'MISSED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(log.logged_at).toLocaleString('en-PH', {
                            timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                    
                    {patientLogs.length === 0 && (
                      <p className="text-[10px] font-bold text-slate-300 text-center py-10 uppercase tracking-widest">No logs yet</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(!links || links.length === 0) && (
            <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
               <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-slate-800">No Patients Found</h2>
               <p className="text-slate-400 mt-2">Link a patient to start tracking their adherence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}