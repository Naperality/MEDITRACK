import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import { Clock, CheckCircle2, Pill, AlertCircle, Calendar, FileText } from "lucide-react";

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetching the updated columns: frequency, start_date, end_date, and instructions
  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('scheduled_time', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Medications</h1>
            <p className="text-slate-500 mt-1">Stay on track with your daily doses</p>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>

        <div className="grid gap-4">
          {meds?.map((med) => {
            // Formatting the time and date for "Taken" status
            const takenTimeDisplay = med.last_taken_at 
              ? new Date(med.last_taken_at).toLocaleString('en-PH', {
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Asia/Manila'
                })
              : null;

            // Logic to check if the prescription has ended
            const isExpired = med.end_date && new Date(med.end_date) < new Date();

            return (
              <div 
                key={med.id} 
                className={`group relative p-6 bg-white rounded-3xl border transition-all duration-300 ${
                  med.is_taken 
                    ? 'border-green-100 bg-green-50/30' 
                    : isExpired 
                      ? 'border-slate-200 bg-slate-100 opacity-60' 
                      : 'border-slate-200 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-3 rounded-2xl ${med.is_taken ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {med.is_taken ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-xl ${med.is_taken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {med.name}
                        </h3>
                        {isExpired && (
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                            Course Ended
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-0.5">
                        {med.dosage} • {med.med_type} • <span className="text-blue-600">{med.frequency}</span>
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="space-y-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg w-fit">
                            <Clock className="w-3.5 h-3.5" /> Schedule: {med.scheduled_time}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit">
                            <Calendar className="w-3.5 h-3.5" /> Until: {new Date(med.end_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {med.is_taken && (
                            <span className="flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Last Taken: {takenTimeDisplay}
                            </span>
                          )}
                          {med.instructions && (
                            <span className="flex items-start gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                              <FileText className="w-3.5 h-3.5 mt-0.5" /> {med.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isExpired && (
                    <form action={async () => {
                      'use server';
                      await toggleMedication(med.id, med.is_taken);
                    }}>
                      <button 
                        type="submit"
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                          med.is_taken 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                            : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-md'
                        }`}
                      >
                        {med.is_taken ? '✓ Taken' : 'Mark as Taken'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
          
          {(!meds || meds.length === 0) && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">Your medication list is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}