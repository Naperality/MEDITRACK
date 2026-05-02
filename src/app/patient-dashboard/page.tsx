import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabaseAdmin } from "@/lib/supabase";
import MedicationReminder from "@/components/MedicationReminder";
import MedicationSlot from "@/components/MedicationSlot";
import SyncTrigger from "@/components/SyncTrigger";
import NotificationSetup from "@/components/NotificationSetup";
import { 
  Pill, History, Activity, CheckCircle2, 
  AlertCircle, Info, Calendar as CalendarIcon,
  Clock, HeartPulse
} from "lucide-react";

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

  const { data: allLogs } = await supabaseAdmin
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(50);

  // --- FIXED TIMEZONE LOGIC (MAINTAINED) ---
  const currentManilaDate = new Date().toLocaleDateString("en-US", { 
    timeZone: "Asia/Manila" 
  });

  const todaysLogs = allLogs?.filter(log => {
    const logDateManila = new Date(log.logged_at).toLocaleDateString("en-US", { 
      timeZone: "Asia/Manila" 
    });
    return logDateManila === currentManilaDate;
  }) || [];

  const nowPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const recentLogs = allLogs?.slice(0, 8) || [];

  // Calculate stats for the "Sleek" header
  const takenCount = todaysLogs.filter(l => l.status === 'TAKEN').length;

  return (
    <div className="min-h-screen bg-[#FBFBFE]">
      <NotificationSetup />
      <SyncTrigger />
      <MedicationReminder meds={meds || []} todaysLogs={todaysLogs} />

      {/* Modern Navigation Bar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-200">
              <HeartPulse className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Patient Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">MediTrack</p>
            </div>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-xl shadow-sm border border-slate-100" } }} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12">
        
        {/* Welcome & Stats Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">Hello there!</h2>
                <p className="text-slate-400 font-medium mb-6">You have <span className="text-rose-400">{meds?.length || 0} active medications</span> in your regimen.</p>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 border border-white/5">
                    <CalendarIcon className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {nowPH.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full" />
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Today's Progress</p>
               <div className="flex items-end gap-2">
                 <span className="text-5xl font-black text-slate-900">{takenCount}</span>
                 <span className="text-slate-400 font-bold mb-1.5 text-lg">/ {meds?.reduce((acc, m) => acc + m.scheduled_times.length, 0)}</span>
               </div>
               <p className="text-slate-500 text-sm mt-2 font-medium">Doses completed today</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Regimen Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-rose-500 rounded-full" />
                Current Regimen
              </h2>
            </div>

            <div className="space-y-6">
              {meds?.map((med) => {
                // --- DATE RANGE VALIDATION (MAINTAINED) ---
                const start = new Date(med.start_date);
                const end = med.end_date ? new Date(med.end_date) : null;
                const compareDate = new Date(nowPH).setHours(0,0,0,0);
                const compareStart = new Date(start).setHours(0,0,0,0);
                const compareEnd = end ? new Date(end).setHours(0,0,0,0) : null;

                const isActive = compareDate >= compareStart && (compareEnd ? compareDate <= compareEnd : true);
                if (!isActive) return null;

                return (
                  <div key={med.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-rose-100">
                    <div className="p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-inner">
                            <Pill size={32} />
                          </div>
                          <div>
                            <h3 className="font-black text-2xl text-slate-900 tracking-tight">{med.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{med.dosage}</span>
                              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{med.med_type}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {med.instructions && (
                        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 items-center">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm">
                             <Info className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-sm font-semibold text-slate-600 italic">"{med.instructions}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity/History Sidebar */}
          <aside className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-slate-200 rounded-full" />
              Activity Log
            </h2>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="space-y-8 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-50" />

                {recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-4 border-white ${log.status === 'TAKEN' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {log.status === 'TAKEN' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none mb-1">{log.med_name}</p>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={10} className="text-slate-300" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">
                          {new Date(log.logged_at).toLocaleTimeString('en-PH', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            timeZone: 'Asia/Manila' 
                          })} 
                          <span className="mx-1 opacity-30">•</span>
                          {new Date(log.logged_at).toLocaleDateString('en-PH', { 
                            month: 'short', 
                            day: 'numeric', 
                            timeZone: 'Asia/Manila' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {recentLogs.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No activity yet</p>
                  </div>
                )}
              </div>
              
              <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-colors">
                View Full History
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}