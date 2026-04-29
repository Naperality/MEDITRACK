import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import { UserButton } from "@clerk/nextjs";
import { Pill, Clock, CheckCircle2 } from "lucide-react";

export default async function PatientDashboard() {
  const { userId, getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!userId || !token) return null;

  const supabase = createClerkSupabaseClient(token);
  const { data: meds } = await supabase.from('medications').select('*').eq('patient_id', userId).order('scheduled_time');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Meds</h1>
            <p className="text-slate-500">Your personal health schedule</p>
          </div>
          <UserButton />
        </header>

        <div className="grid gap-4">
          {meds?.map((med) => {
             const takenTime = med.last_taken_at 
             ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { 
                 hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' 
               }) : null;

            return (
              <div key={med.id} className={`p-6 bg-white rounded-3xl border transition-all ${
                med.is_taken ? 'border-green-100 bg-green-50/20' : 'border-slate-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-5 items-center">
                    <div className={`p-4 rounded-2xl ${med.is_taken ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-xl ${med.is_taken ? 'line-through text-slate-400' : 'text-slate-800'}`}>{med.name}</h3>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{med.dosage} • {med.med_type}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">
                           <Clock className="w-3 h-3" /> {med.scheduled_time}
                        </span>
                        {med.is_taken && (
                          <span className="flex items-center gap-1 text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Done at {takenTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <form action={async () => { 'use server'; await toggleMedication(med.id, med.is_taken); }}>
                    <button type="submit" className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${
                      med.is_taken ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}>
                      {med.is_taken ? '✓ Done' : 'Mark Taken'}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}