import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toggleMedication } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";

export default async function PatientDashboard() {
  const { userId } = await auth();
  
  // Guard clause: Ensures userId is a string and not null
  if (!userId) return null;

  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Medications</h1>
        <UserButton />
      </header>

      <div className="mb-10">
        <AddMedicationForm patientId={userId} />
      </div>

      <div className="grid gap-4">
        {meds?.map((med) => (
          <div key={med.id} className="p-4 bg-white shadow rounded-lg flex justify-between items-center border-l-4 border-blue-500">
            <div>
              <h3 className="font-bold text-lg">{med.name}</h3>
              <p className="text-sm text-gray-500">{med.dosage} • {med.med_type}</p>
              <p className="text-xs font-mono mt-1 text-blue-600">Time: {med.scheduled_time}</p>
            </div>
            
            <form action={async () => {
              'use server';
              await toggleMedication(med.id, med.is_taken);
            }}>
              <button 
                type="submit"
                className={`px-4 py-2 rounded transition-colors ${
                  med.is_taken ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {med.is_taken ? '✓ Taken' : 'Mark as Taken'}
              </button>
            </form>
          </div>
        ))}
        {meds?.length === 0 && <p className="text-gray-400">No medications scheduled.</p>}
      </div>
    </div>
  );
}