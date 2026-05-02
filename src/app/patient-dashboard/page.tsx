import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabaseAdmin } from "@/lib/supabase";
import MedicationReminder from "@/components/MedicationReminder";
import MedicationSlot from "@/components/MedicationSlot";
import SyncTrigger from "@/components/SyncTrigger";
import { Pill, History, Activity, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { syncMissedDoses } from "@/app/actions/medication";
import NotificationSetup from "@/components/NotificationSetup";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: meds } = await supabaseAdmin
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

    if (meds && meds.length > 0) {
    await syncMissedDoses(meds, userId);
  }
  
  const { data: allLogs } = await supabaseAdmin
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(50);

  // --- FIXED TIMEZONE LOGIC ---
  // Get the current date string in Manila format (e.g., "5/2/2026")
  const currentManilaDate = new Date().toLocaleDateString("en-US", { 
    timeZone: "Asia/Manila" 
  });

  // Filter logs by comparing the log's Manila date string to today's Manila date string
  const todaysLogs = allLogs?.filter(log => {
    const logDateManila = new Date(log.logged_at).toLocaleDateString("en-US", { 
      timeZone: "Asia/Manila" 
    });
    return logDateManila === currentManilaDate;
  }) || [];

  // Used for calculating if a medication is currently within its active start/end date range
  const nowPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const recentLogs = allLogs?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <NotificationSetup /> ADD THIS HERE
      <SyncTrigger />
      <MedicationReminder meds={meds || []} todaysLogs={todaysLogs} />

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Health</h1>
            <p className="text-slate-500 mt-2 font-medium">MediTrack: Patient Portal</p>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl shadow-md" } }} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Today's Regimen
            </h2>

            {meds?.map((med) => {
              // --- DATE RANGE VALIDATION ---
              const start = new Date(med.start_date);
              const end = med.end_date ? new Date(med.end_date) : null;
              
              const compareDate = new Date(nowPH).setHours(0,0,0,0);
              const compareStart = new Date(start).setHours(0,0,0,0);
              const compareEnd = end ? new Date(end).setHours(0,0,0,0) : null;

              const isActive = compareDate >= compareStart && (compareEnd ? compareDate <= compareEnd : true);

              if (!isActive) return null;

              return (
                <div key={med.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="flex gap-5 mb-6">
                    <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white shadow-lg shadow-blue-100">
                      <Pill size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-3xl text-slate-800">{med.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{med.dosage}</span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{med.med_type}</span>
                      </div>
                    </div>
                  </div>

                  {med.instructions && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-center">
                      <Info className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-sm font-bold text-amber-800">{med.instructions}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {med.scheduled_times.map((time: string) => (
                      <MedicationSlot 
                        key={time} 
                        med={med} 
                        time={time} 
                        userId={userId} 
                        dbStatus={todaysLogs.find(l => l.med_id === med.id && l.scheduled_slot === time)?.status} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-fit">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-8">
              <History className="w-5 h-5 text-blue-600" /> Log History
            </h2>
            <div className="space-y-6">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.status === 'TAKEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {log.status === 'TAKEN' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{log.med_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {/* Format the Time */}
                      {new Date(log.logged_at).toLocaleTimeString('en-PH', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        timeZone: 'Asia/Manila' 
                      })} 
                      • 
                      {/* Format the Date - Add timeZone here to fix the "May 1" issue */}
                      {new Date(log.logged_at).toLocaleDateString('en-PH', { 
                        month: 'short', 
                        day: 'numeric', 
                        timeZone: 'Asia/Manila' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}