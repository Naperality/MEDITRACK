import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import { recordMedicationAction } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";
import { 
  UserPlus, Activity, CheckCircle2, Clock, 
  Calendar, AlertCircle, History, Pill 
} from "lucide-react";

export default async function CaregiverDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // FETCH: Links, Patient Profiles, Medications, AND the new Logs
  const { data: links } = await supabase
    .from('caregiver_patient')
    .select(`
      patient_id,
      profiles!patient_id (
        full_name,
        medications (
          id, name, dosage, med_type, scheduled_times, 
          daily_count, is_taken, last_taken_at, start_date, end_date
        ),
        medication_logs (
          id, med_name, status, logged_at
        )
      )
    `)
    .eq('caregiver_id', userId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Caregiver Portal</h1>
            <p className="text-slate-500 mt-1 font-medium">Monitoring adherence for linked patients</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl" } }} />
          </div>
        </header>

        {/* Link Patient Section */}
        <section className="mb-12 bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Monitor New Patient</h2>
            </div>
            <form action={async (formData: FormData) => {
              'use server';
              const email = formData.get('email') as string;
              await linkPatient(userId, email);
            }} className="flex flex-col sm:flex-row gap-4">
              <input 
                name="email" 
                type="email"
                className="flex-1 p-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Patient's email address..."
                required
              />
              <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-500 transition-all active:scale-95 shadow-lg">
                Connect Account
              </button>
            </form>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        </section>

        <div className="grid grid-cols-1 gap-10">
          {links?.map((link: any) => (
            <div key={link.patient_id} className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden flex flex-col lg:flex-row">
              
              {/* LEFT: Patient Status & Meds */}
              <div className="flex-1 p-8 lg:border-r border-slate-100">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                      {link.profiles.full_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 leading-none">{link.profiles.full_name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Patient Dashboard Active</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                   <AddMedicationForm patientId={link.patient_id} />
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Pill className="w-4 h-4" /> Prescription Adherence
                </h4>
                
                <div className="space-y-4">
                  {link.profiles.medications?.map((med: any) => (
                    <div key={med.id} className={`p-6 rounded-3xl border transition-all ${
                        med.is_taken ? 'bg-green-50/30 border-green-100' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-black text-slate-800 text-lg">{med.name}</p>
                        <form action={async () => {
                          'use server';
                          // Now uses the logging action
                          await recordMedicationAction(med.id, link.patient_id, med.name);
                        }}>
                          <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            med.is_taken ? 'bg-green-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-500 hover:text-blue-600'
                          }`}>
                            {med.is_taken ? 'Verified' : 'Log Taken'}
                          </button>
                        </form>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {med.scheduled_times?.map((t: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm text-slate-600">
                            <Clock className="w-3 h-3 text-blue-500" /> {t}
                          </span>
                        ))}
                      </div>

                      {med.is_taken && (
                        <p className="text-[10px] font-bold text-green-600 flex items-center gap-1.5 bg-green-100/50 w-fit px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 
                          Last dose verified: {new Date(med.last_taken_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Scrollable History Logs Sidebar */}
              <div className="w-full lg:w-80 bg-slate-50/50 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-blue-600" />
                  <h4 className="font-black text-slate-800 text-sm">Activity Logs</h4>
                </div>

                {/* Scrollable Container */}
                <div className="h-[450px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {link.profiles.medication_logs?.sort((a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()).map((log: any) => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative pl-10 overflow-hidden group hover:border-blue-200 transition-colors">
                      <div className="absolute left-3 top-4 bottom-4 w-1 bg-green-500 rounded-full group-hover:bg-blue-500 transition-colors" />
                      <p className="text-xs font-black text-slate-800">{log.med_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {new Date(log.logged_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} at {new Date(log.logged_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="inline-block mt-2 text-[8px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
                        CONFIRMED
                      </span>
                    </div>
                  ))}

                  {(!link.profiles.medication_logs || link.profiles.medication_logs.length === 0) && (
                    <div className="text-center py-20 opacity-40">
                       <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No logs yet</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}