import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import { toggleMedication } from "@/app/actions/medication";

export default async function CaregiverDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: links } = await supabase
    .from('caregiver_patient')
    .select(`
      patient_id,
      profiles!patient_id (
        full_name,
        medications (
          id,
          name,
          dosage,
          med_type,
          scheduled_time,
          is_taken,
          last_taken_at
        )
      )
    `)
    .eq('caregiver_id', userId);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caregiver Portal</h1>
          <p className="text-slate-500">Monitoring patient adherence</p>
        </div>
        <UserButton />
      </header>

      <section className="mb-10 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-700">Link a New Patient</h2>
        <form action={async (formData: FormData) => {
          'use server';
          const email = formData.get('email') as string;
          await linkPatient(userId, email);
        }} className="flex gap-2">
          <input 
            name="email" 
            type="email" 
            placeholder="Patient's registered email" 
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required 
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Link Account
          </button>
        </form>
      </section>

      <div className="space-y-8">
        <h2 className="text-xl font-bold text-slate-800">Linked Patients</h2>
        {links?.map((link: any) => (
          <div key={link.patient_id} className="p-6 bg-white border rounded-2xl shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-blue-600 flex items-center">
              <span className="bg-blue-50 p-2 rounded-lg mr-3 text-lg">👤</span>
              {link.profiles.full_name}
            </h3>

            <div className="grid gap-3">
              {link.profiles.medications?.map((med: any) => {
                const takenTime = med.last_taken_at 
                  ? new Date(med.last_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : null;

                return (
                  <div key={med.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.dosage} • {med.med_type}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-[10px] font-mono text-blue-500 uppercase tracking-wider">Sched: {med.scheduled_time}</p>
                        {med.is_taken && (
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider italic">Recorded: {takenTime}</p>
                        )}
                      </div>
                    </div>

                    <form action={async () => {
                      'use server';
                      await toggleMedication(med.id, med.is_taken);
                    }}>
                      <button 
                        type="submit"
                        className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all ${
                          med.is_taken 
                            ? 'bg-green-600 text-white shadow-inner' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {med.is_taken ? '✓ Verified' : 'Mark Taken'}
                      </button>
                    </form>
                  </div>
                );
              })}
              {link.profiles.medications?.length === 0 && (
                <p className="text-sm text-slate-400 italic py-2">No medications listed for this patient.</p>
              )}
            </div>
          </div>
        ))}
        {links?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
            <p className="text-slate-400">No patients linked to your account yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}