import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import { Clock, CheckCircle2, Pill, AlertCircle, Calendar, FileText, AlertTriangle } from "lucide-react";

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetching medications with the updated schema
  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Medications</h1>
            <p className="text-slate-500 mt-1">MediTrack: Your personalized recovery companion</p>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>

        <div className="grid gap-6">
          {meds?.map((med) => {
            // 1. Time & Date Logic
            const now = new Date();
            const isExpired = med.end_date && new Date(med.end_date) < now;
            
            // 2. Missed Dose Logic
            // A dose is "Missed" if not taken and it's 1 hour past the LAST scheduled time of the day
            const lastTime = med.scheduled_times[med.scheduled_times.length - 1];
            const [hours, minutes] = lastTime.split(':').map(Number);
            const todayDeadline = new Date();
            todayDeadline.setHours(hours, minutes, 0);
            
            const isMissed = !med.is_taken && !isExpired && (now.getTime() > todayDeadline.getTime() + 3600000);

            // 3. Formatting Last Taken Display
            const takenTimeDisplay = med.last_taken_at 
              ? new Date(med.last_taken_at).toLocaleString('en-PH', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila'
                })
              : null;

            return (
              <div 
                key={med.id} 
                className={`group relative p-6 bg-white rounded-3xl border transition-all duration-300 ${
                  med.is_taken 
                    ? 'border-green-100 bg-green-50/30' 
                    : isMissed 
                      ? 'border-red-200 bg-red-50 shadow-sm' 
                      : isExpired 
                        ? 'border-slate-200 bg-slate-100 opacity-60' 
                        : 'border-slate-200 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-4 rounded-2xl ${
                      med.is_taken ? 'bg-green-100 text-green-600' : 
                      isMissed ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {med.is_taken ? <CheckCircle2 className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-bold text-2xl ${med.is_taken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {med.name}
                        </h3>
                        {isMissed && (
                          <span className="flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-1 rounded-lg uppercase animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Missed
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded-lg uppercase">
                            Finished
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {med.dosage} • {med.med_type} • <span className="text-blue-600">{med.daily_count}x daily</span>
                      </p>

                      {/* Frequency Schedule Grid */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {med.scheduled_times.map((time: string, i: number) => (
                          <span key={i} className="flex items-center gap-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl shadow-sm">
                            <Clock className="w-3 h-3 text-blue-500" /> {time}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Duration: {new Date(med.start_date).toLocaleDateString()} - {new Date(med.end_date).toLocaleDateString()}
                          </p>
                          {med.instructions && (
                            <p className="flex items-start gap-2 text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-100">
                              <FileText className="w-4 h-4 mt-0.5" />
                              {med.instructions}
                            </p>
                          )}
                        </div>

                        {med.is_taken && (
                          <div className="flex flex-col justify-end">
                            <p className="text-[10px] font-black text-green-600 uppercase mb-1">Confirmation</p>
                            <p className="text-xs font-bold text-slate-500 italic">
                              Successfully taken at {takenTimeDisplay}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isExpired && (
                    <form action={async () => {
                      'use server';
                      await toggleMedication(med.id, med.is_taken);
                    }} className="w-full md:w-auto">
                      <button 
                        type="submit"
                        className={`w-full md:w-auto px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                          med.is_taken 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-100' 
                            : 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95 shadow-slate-200'
                        }`}
                      >
                        {med.is_taken ? '✓ Dose Recorded' : 'Mark as Taken'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
          
          {(!meds || meds.length === 0) && (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">No active prescriptions</h2>
              <p className="text-slate-400 max-w-xs mx-auto mt-2">When your caregiver adds a medication, it will appear here with your daily schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}