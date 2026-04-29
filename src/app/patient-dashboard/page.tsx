import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";
import { Clock, CheckCircle2, Pill, AlertCircle } from "lucide-react";

export default async function PatientDashboard() {
  const { userId, getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!userId || !token) return null;

  const supabase = createClerkSupabaseClient(token);
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
          <UserButton />
        </header>

        <div className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <AddMedicationForm patientId={userId} />
        </div>

        <div className="grid gap-4">
          {meds?.map((med) => {
            const takenTimeDisplay = med.last_taken_at 
              ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' })
              : null;

            return (
              <div key={med.id} className={`p-6 bg-white rounded-3xl border transition-all ${med.is_taken ? 'border-green-100 bg-green-50/30' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-3 rounded-2xl ${med.is_taken ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {med.is_taken ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-xl ${med.is_taken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{med.name}</h3>
                      <p className="text-sm font-medium text-slate-500 uppercase mt-0.5">{med.dosage} • {med.med_type}</p>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg"><Clock className="w-3.5 h-3.5" /> {med.scheduled_time}</span>
                         {med.is_taken && <span className="flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Taken: {takenTimeDisplay}</span>}
                      </div>
                    </div>
                  </div>

                  <form action={async () => {
                    'use server';
                    await toggleMedication(med.id, med.is_taken);
                  }}>
                    <button type="submit" className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${med.is_taken ? 'bg-green-600 text-white' : 'bg-slate-900 text-white shadow-md'}`}>
                      {med.is_taken ? '✓ Done' : 'Mark as Taken'}
                    </button>
                  </form>
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