import Link from "next/link";
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
  Clock, HeartPulse, Ban
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

  const nowPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const compareDate = new Date(nowPH).setHours(0, 0, 0, 0);
  const recentLogs = allLogs?.slice(0, 8) || [];

  // 2. FILTER MEDICATIONS ONCE (The "Source of Truth")
  // This array only contains meds that are: 
  // - Not discontinued AND 
  // - Within the valid start/end date range
  const activeMeds = meds?.filter(med => {
    // Check discontinued status
    if (med.is_discontinued) return false;

    // Date range validation
    const start = new Date(med.start_date);
    const end = med.end_date ? new Date(med.end_date) : null;
    const compareStart = new Date(start).setHours(0, 0, 0, 0);
    const compareEnd = end ? new Date(end).setHours(0, 0, 0, 0) : null;

    return compareDate >= compareStart && (compareEnd ? compareDate <= compareEnd : true);
  }) || [];

  // 3. STATS CALCULATION
  // Calculate total doses ONLY from the active meds filtered above
  const totalScheduledDoses = activeMeds.reduce((acc, m) => acc + (m.scheduled_times?.length || 0), 0);

  const cManDate = nowPH.toLocaleDateString("en-US");

  const todaysLogs = allLogs?.filter(log => {
    const logDateManila = new Date(log.logged_at).toLocaleDateString("en-US", { 
      timeZone: "Asia/Manila" 
    });
    return logDateManila === currentManilaDate;
  }) || [];

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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">MediNow</p>
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
                <p className="text-slate-400 font-medium mb-6">You have <span className="text-rose-400">{activeMeds?.length || 0} active medications</span> in your regimen.</p>
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
                 <span className="text-slate-400 font-bold mb-1.5 text-lg">/ {totalScheduledDoses}</span>
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
                // 1. Check if the medication is explicitly marked as discontinued
                if (med.is_discontinued === true) return null;
                // --- DATE RANGE VALIDATION (MAINTAINED) ---
                const start = new Date(med.start_date);
                const end = med.end_date ? new Date(med.end_date) : null;
                const compareDate = new Date(nowPH).setHours(0,0,0,0);
                const compareStart = new Date(start).setHours(0,0,0,0);
                const compareEnd = end ? new Date(end).setHours(0,0,0,0) : null;

                const isActive = compareDate >= compareStart && (compareEnd ? compareDate <= compareEnd : true);
                if (!isActive) return null;

                return (
                  <div key={med.id} className="group bg-white rounded-[2rem] border-l-4 border-l-rose-500 border-y border-r border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="p-5 sm:p-7">
                      {/* Top Info Row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                            <Pill className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                              {med.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-wider">
                                {med.dosage}
                              </span>
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-black uppercase tracking-wider">
                                {med.med_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Instructions - More subtle on mobile */}
                      {med.instructions && (
                        <div className="mb-6 flex items-start gap-2 text-slate-500">
                          <Info className="w-3.5 h-3.5 mt-0.5 text-blue-400 shrink-0" />
                          <p className="text-[11px] sm:text-xs font-semibold leading-relaxed italic">
                            {med.instructions}
                          </p>
                        </div>
                      )}

                      {/* Schedule Grid - Optimized for Mobile Screens */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Schedule</p>
                        </div>
                        {/* Change the dbStatus logic to this: */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                          {med.scheduled_times.map((time: string) => {
                            // Find a log where the med_id matches AND the time starts with our slot time
                            // (This handles "13:00" vs "13:00:00" automatically)
                            const logForThisSlot = todaysLogs.find(l => 
                              l.med_id === med.id && 
                              l.scheduled_slot.startsWith(time.slice(0, 5))
                            );

                            return (
                              <MedicationSlot 
                                key={time} 
                                med={med} 
                                time={time} 
                                userId={userId} 
                                dbStatus={logForThisSlot?.status} 
                              />
                            );
                          })}
                        </div>
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
              {/* 
                  Scrollable Container: 
                  - max-h-[500px] sets the height before scrolling starts
                  - scrollbar-hide keeps it looking clean
              */}
              <div className="space-y-8 relative max-h-[550px] overflow-y-auto pr-2 scrollbar-hide">
                
                {/* Vertical Timeline Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-50" />

                {/* 
                    Using allLogs instead of recentLogs 
                    to show the full 50 items fetched 
                */}
                {allLogs?.map((log) => {
                  // 1. Determine the visual style based on status
                  let statusStyles = {
                    color: "bg-rose-500", 
                    icon: <AlertCircle size={18} />,
                    label: ""
                  };

                  if (log.status === 'TAKEN') {
                    statusStyles = {
                      color: "bg-green-500",
                      icon: <CheckCircle2 size={18} />,
                      label: ""
                    };
                  } else if (log.status === 'DISCONTINUED') {
                    statusStyles = {
                      color: "bg-slate-400", // Gray indicates "Inactive/Stopped"
                      icon: <Ban size={18} />,
                      label: " (Stopped)"
                    };
                  }

                  return (
                    <div key={log.id} className="flex gap-4 relative z-10 group">
                      {/* Dynamic Background Color */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-4 border-white transition-all group-hover:scale-110 ${statusStyles.color} text-white`}>
                        {statusStyles.icon}
                      </div>
                      
                      <div className="pt-1">
                        <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-rose-600 transition-colors">
                          {log.med_name}
                          {/* Show the "Stopped" label only for discontinued logs */}
                          {log.status === 'DISCONTINUED' && (
                            <span className="ml-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              Stopped
                            </span>
                          )}
                        </p>
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
                  );
                })}

                {(!allLogs || allLogs.length === 0) && (
                  <div className="text-center py-10">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No activity yet</p>
                  </div>
                )}
              </div>

              {/* Subtle indicator that there is more to scroll */}
              <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  End of recent activity
                </p>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}