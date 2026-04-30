import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { recordMedicationAction } from "@/app/actions/medication";
import MedicationReminder from "@/components/MedicationReminder"; // We will create this below
import { 
  Clock, CheckCircle2, Pill, AlertCircle, 
  Calendar, FileText, AlertTriangle, History, 
  Activity, ArrowRight
} from "lucide-react";

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Fetch Medications
  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  // 2. Fetch Recent Logs (The History)
  const { data: logs } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', userId)
    .order('logged_at', { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      {/* Client-side logic for live pop-up reminders */}
      <MedicationReminder meds={meds || []} />

      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Tracker</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">v2.0</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">My Health</h1>
            <p className="text-slate-500 mt-2 font-medium">MediTrack: Your personalized recovery companion</p>
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
          {/* Main Content: Medication Cards */}
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

            {meds?.map((med) => {
              const now = new Date();
              const isExpired = med.end_date && new Date(med.end_date) < now;
              
              // Missed Logic: 1 hour past the last scheduled time
              const lastTimeStr = med.scheduled_times[med.scheduled_times.length - 1];
              const [hours, minutes] = lastTimeStr.split(':').map(Number);
              const todayDeadline = new Date();
              todayDeadline.setHours(hours, minutes, 0);
              const isMissed = !med.is_taken && !isExpired && (now.getTime() > todayDeadline.getTime() + 3600000);

              const takenTimeDisplay = med.last_taken_at 
                ? new Date(med.last_taken_at).toLocaleString('en-PH', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  }) : null;

              return (
                <div key={med.id} className={`group relative p-8 bg-white rounded-[2.5rem] border transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 ${
                    med.is_taken ? 'border-green-100' : isMissed ? 'border-red-100 bg-red-50/30' : 'border-slate-100'
                }`}>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-5">
                        <div className={`p-5 rounded-[1.5rem] transition-colors ${
                          med.is_taken ? 'bg-green-100 text-green-600' : isMissed ? 'bg-red-100 text-red-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        }`}>
                          {med.is_taken ? <CheckCircle2 className="w-8 h-8" /> : <Pill className="w-8 h-8" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`font-black text-2xl tracking-tight ${med.is_taken ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                              {med.name}
                            </h3>
                            {isMissed && (
                              <span className="flex items-center gap-1 text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Missed Dose
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {med.dosage} <span className="w-1 h-1 bg-slate-200 rounded-full"/> {med.med_type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Daily Schedule
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {med.scheduled_times.map((time: string, i: number) => (
                            <span key={i} className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-2xl shadow-sm group-hover:border-blue-200 transition-colors">
                                {time}
                            </span>
                            ))}
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

                      {!isExpired && (
                        <form action={async () => {
                          'use server';
                          // Note: Ensure recordMedicationAction handles logging to medication_logs
                          await recordMedicationAction(med.id, userId, med.name);
                        }} className="w-full md:w-auto">
                          <button 
                            type="submit"
                            disabled={med.is_taken}
                            className={`w-full md:w-auto px-10 py-5 rounded-3xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-xl ${
                              med.is_taken 
                                ? 'bg-green-100 text-green-700 shadow-none cursor-default' 
                                : 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1 shadow-slate-200 active:scale-95'
                            }`}
                          >
                            {med.is_taken ? <><CheckCircle2 className="w-5 h-5"/> Recorded</> : 'Mark as Taken'}
                          </button>
                        </form>
                      )}
                    </div>

                    {med.is_taken && (
                        <p className="text-[10px] font-bold text-green-600 italic text-right">
                           Verified dose at {takenTimeDisplay}
                        </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar: Activity History Logs */}
          <aside className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Log History
                    </h2>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>

                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                    {logs?.map((log) => (
                        <div key={log.id} className="relative pl-10 group">
                            <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                                log.status === 'TAKEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {log.status === 'TAKEN' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 leading-tight">{log.med_name}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                    <span>{new Date(log.logged_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span>{new Date(log.logged_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span className={`inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-md ${
                                    log.status === 'TAKEN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    {log.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    {(!logs || logs.length === 0) && (
                        <div className="text-center py-12">
                            <p className="text-xs font-bold text-slate-400 italic">No activity recorded yet.</p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-10 py-4 border-2 border-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    View Full Report <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {/* Health Tip Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
                <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
                <h3 className="font-black text-lg leading-tight mb-2">Remember consistency is key!</h3>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                    Setting a fixed routine for your medication helps your body maintain a steady level of the treatment.
                </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}