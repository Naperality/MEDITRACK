import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { syncMissedDoses } from "@/app/actions/medication";
import MedicationReminder from "@/components/MedicationReminder";
import MedicationSlot from "@/components/MedicationSlot";
import { Clock, Pill, Calendar, FileText, History, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  if (meds && meds.length > 0) {
    await syncMissedDoses(meds, userId);
  }

  // Fetch all recent logs to derive both "Today" and "History"
  const { data: allLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(50);

  const todayStr = new Date().toDateString();
  
  // Filter for the UI buttons (Today only)
  const todaysLogs = allLogs?.filter(log => 
    new Date(log.logged_at).toDateString() === todayStr
  ) || [];

  // Display the last 8 events in the sidebar
  const recentLogs = allLogs?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <MedicationReminder meds={meds || []} todaysLogs={todaysLogs} />

      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">My Health</h1>
            <p className="text-slate-500 mt-2 font-medium">MediTrack: Patient Portal</p>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl" } }} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Today's Regimen
            </h2>

            {meds?.map((med) => (
              <div key={med.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex gap-5 mb-6">
                  <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white"><Pill /></div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-800">{med.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase">{med.dosage} • {med.med_type}</p>
                  </div>
                </div>

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
                    <div key={log.id} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        log.status === 'TAKEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {log.status === 'TAKEN' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{log.med_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {isToday ? "Today" : dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className={`text-[9px] font-black ${log.status === 'TAKEN' ? 'text-blue-500' : 'text-red-500'}`}>
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