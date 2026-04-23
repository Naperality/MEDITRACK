import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId)
    .order('scheduled_time', { ascending: true });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Medications</h1>
          <p className="text-slate-500">Stay on track with your daily doses</p>
        </div>
        <UserButton />
      </header>

      <div className="mb-10">
        <AddMedicationForm patientId={userId} />
      </div>

      <div className="grid gap-4">
        {meds?.map((med) => {
          // This ensures the UTC string from Supabase is converted to the user's local time
          const takenTimeDisplay = med.last_taken_at 
            ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Manila' // Force it to Philippine Time for your capstone demo
              })
            : null;

          return (
            <div key={med.id} className={`p-5 bg-white shadow-sm rounded-xl flex justify-between items-center border-l-4 transition-all ${med.is_taken ? 'border-green-500 opacity-80' : 'border-blue-500'}`}>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{med.name}</h3>
                <p className="text-sm text-slate-500">{med.dosage} • {med.med_type}</p>
                <div className="flex gap-4 mt-2">
                   <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Scheduled: {med.scheduled_time}</p>
                   {med.is_taken && (
                     <p className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Taken at: {takenTimeDisplay}</p>
                   )}
                </div>
              </div>
              
              <form action={async () => {
                'use server';
                await toggleMedication(med.id, med.is_taken);
              }}>
                <button 
                  type="submit"
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    med.is_taken 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
                  }`}
                >
                  {med.is_taken ? '✓ Done' : 'Mark as Taken'}
                </button>
              </form>
            </div>
          );
        })}
        {meds?.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
            <p className="text-gray-400">Your medication list is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}