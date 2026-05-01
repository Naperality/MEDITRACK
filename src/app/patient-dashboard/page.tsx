import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { syncMissedDoses } from "@/app/actions/medication";
import MedicationReminder from "@/components/MedicationReminder";
import MedicationSlot from "@/components/MedicationSlot";
import { Clock, Pill, History, Activity, CheckCircle2, AlertCircle, Info } from "lucide-react";

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

  // 2. Sync Missed Doses BEFORE fetching logs
  // This ensures the sidebar sees today's missed doses immediately
  if (meds && meds.length > 0) {
    await syncMissedDoses(meds, userId);
  }

  // 3. Fetch logs AFTER the sync is done
  const { data: allLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(50);

  const todayStr = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })).toDateString();
  
  const todaysLogs = allLogs?.filter(log => 
    new Date(log.logged_at).toDateString() === todayStr
  ) || [];

  const recentLogs = allLogs?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <MedicationReminder meds={meds || []} todaysLogs={todaysLogs} />

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">My Health</h1>
            <p className="text-slate-500 mt-2 font-medium">MediTrack: Patient Portal</p>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl shadow-md" } }} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Today's Regimen
            </h2>

            {meds?.map((med) => (
              <div key={med.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex gap-5 mb-6">
                  <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white shadow-lg shadow-blue-100">
                    <Pill size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl text-slate-800">{med.name}</h3>
                    {/* SHOW ALL INFO: Dosage and Type */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {med.dosage}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {med.med_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SHOW ALL INFO: Instructions Box */}
                {med.instructions && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-center">
                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm font-bold text-amber-800">{med.instructions}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {med.scheduled_times.map((time: string) => {
                    const logForSlot = todaysLogs.find(log => 
                      log.med_id === med.id && log.scheduled_slot === time
                    );
                    return (
                      <MedicationSlot 
                        key={time} 
                        med={med} 
                        time={time} 
                        userId={userId} 
                        dbStatus={logForSlot?.status} 
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-8">
                <History className="w-5 h-5 text-blue-600" /> Log History
              </h2>
              <div className="space-y-6">
                {recentLogs.map((log) => {
                  const dateObj = new Date(log.logged_at);
                  const isToday = dateObj.toDateString() === todayStr;
                  return (
                    <div key={log.id} className="flex gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        log.status === 'TAKEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {log.status === 'TAKEN' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                          {log.med_name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {isToday ? "Today" : dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className={`text-[9px] font-black mt-0.5 ${log.status === 'TAKEN' ? 'text-blue-500' : 'text-red-500'}`}>
                          {log.status === 'TAKEN' ? `COMPLETED SLOT: ${log.scheduled_slot}` : 'MISSED SCHEDULE'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}