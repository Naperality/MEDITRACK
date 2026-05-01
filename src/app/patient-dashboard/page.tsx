import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { syncMissedDoses } from "@/app/actions/medication";
import MedicationReminder from "@/components/MedicationReminder";
import MedicationSlot from "@/components/MedicationSlot";
import { 
  Clock, Pill, Calendar, FileText, 
  History, Activity, CheckCircle2, AlertCircle
} from "lucide-react";

// FORCE FRESH DATA: This prevents the '304 Not Modified' caching in Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Fetch Medications
  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  // 2. Trigger Proactive Sync (Await this so DB is updated before next steps)
  if (meds && meds.length > 0) {
    await syncMissedDoses(meds, userId);
  }

  // 3. Fetch Today's Logs (After sync, to get updated statuses)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const { data: todaysLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .gte('logged_at', todayStart.toISOString());

  // 4. Fetch Recent Logs for History Sidebar (Now includes synced missed doses)
  const { data: recentLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <MedicationReminder meds={meds || []} todaysLogs={todaysLogs || []} />

      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Tracker</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">v2.0</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">My Health</h1>
            <p className="text-slate-500 mt-2 font-medium">MediTrack: Proactive Recovery Companion</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-right hidden md:block px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Account</p>
                <p className="text-xs font-bold text-slate-800">Patient Portal</p>
            </div>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl" } }} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Today's Regimen
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {meds?.length || 0} Prescriptions
                </span>
            </div>

            {meds?.map((med) => (
              <div key={med.id} className="group relative p-8 bg-white rounded-[2.5rem] border border-slate-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-900/5">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-5">
                      <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <Pill className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-black text-2xl tracking-tight text-slate-800">
                          {med.name}
                        </h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          {med.dosage} <span className="w-1 h-1 bg-slate-200 rounded-full"/> {med.med_type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Daily Schedule:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {med.scheduled_times.map((time: string) => {
                        // Find if there's an existing log for this specific slot today
                        const logForSlot = todaysLogs?.find(log => 
                          log.med_id === med.id && log.scheduled_slot === time
                        );

                        return (
                          <MedicationSlot 
                            key={time}
                            med={med}
                            time={time}
                            userId={userId}
                            dbStatus={logForSlot?.status} // Pass 'TAKEN' or 'MISSED' from DB
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 pt-2">
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{new Date(med.start_date).toLocaleDateString()} - {new Date(med.end_date).toLocaleDateString()}</span>
                          </div>
                      </div>
                      {med.instructions && (
                        <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                          <FileText className="w-4 h-4 text-amber-600 mt-0.5" />
                          <p className="text-xs font-bold text-amber-800 leading-relaxed">{med.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Log History
                    </h2>
                </div>

                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                    {recentLogs?.map((log) => (
                        <div key={log.id} className="relative pl-10 group">
                            <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 ${
                              log.status === 'TAKEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {log.status === 'TAKEN' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 leading-tight">{log.med_name}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                    <span>{new Date(log.logged_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className={log.status === 'MISSED' ? 'text-red-500' : ''}>
                                      {log.status === 'TAKEN' ? `Slot: ${log.scheduled_slot}` : 'MISSED'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}