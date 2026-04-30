import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import { recordMedicationAction } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";
import { UserPlus, Activity, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

export default async function CaregiverDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // UPDATED SELECT: Fetching the new columns (scheduled_times, daily_count, end_date)
  const { data: links } = await supabase
    .from('caregiver_patient')
    .select(`
      patient_id,
      profiles!patient_id (
        full_name,
        medications (
          id,
          name,
          dosage,
          med_type,
          scheduled_times,
          daily_count,
          is_taken,
          last_taken_at,
          start_date,
          end_date
        )
      )
    `)
    .eq('caregiver_id', userId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Caregiver Portal</h1>
            <p className="text-slate-500 mt-1">Real-time monitoring of patient adherence</p>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>

        {/* Section to link a new patient */}
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
              className="flex-1 p-4 rounded-2xl border-none text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-white/20 outline-none"
              placeholder="Enter patient's exact email address..."
              required
            />
            <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
              Monitor Patient
            </button>
          </form>
        </section>

        <div className="space-y-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Active Patient Records
          </h2>
          
          {links?.map((link: any) => (
            <div key={link.patient_id} className="overflow-hidden bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              {/* Patient Header */}
              <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                    {link.profiles.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{link.profiles.full_name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Patient ID: {link.patient_id.slice(0,8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connected</span>
                </div>
              </div>
              
              {/* Prescribe New Med Form */}
              <div className="p-8 bg-white border-b border-slate-50">
                 <AddMedicationForm patientId={link.patient_id} />
              </div>

              {/* Medication Adherence List */}
              <div className="p-4 space-y-3">
                {link.profiles.medications?.map((med: any) => {
                  const takenTime = med.last_taken_at 
                    ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { 
                        hour: '2-digit', minute: '2-digit', hour12: true 
                      }) : null;

                  return (
                    <div key={med.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-3xl transition-all ${
                        med.is_taken ? 'bg-green-50/40 border border-green-100' : 'bg-slate-50 border border-slate-100'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 text-lg">{med.name}</p>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {med.daily_count}x / Day
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">{med.dosage} • {med.med_type}</p>
                        
                        {/* Schedule Chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {med.scheduled_times?.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-500" /> {t}
                            </span>
                          ))}
                        </div>

                        {/* NEW: Responsive Date Labels */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-slate-400 uppercase tracking-tighter">Start:</span>
                            <span>{new Date(med.start_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-slate-400 uppercase tracking-tighter">End:</span>
                            <span>{new Date(med.end_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Taken Status Label */}
                        {med.is_taken && (
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 
                            Recorded at {takenTime}
                          </div>
                        )}
                      </div>

                      
                    </div>
                  );
                })}

                {link.profiles.medications?.length === 0 && (
                  <div className="text-center py-10">
                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium italic">No active prescriptions for this patient.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(!links || links.length === 0) && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <UserPlus className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">No Patients Linked</h2>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto">Enter a registered patient's email above to start monitoring their medication schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}