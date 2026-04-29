import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import { toggleMedication } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";
import { UserPlus, Activity, CheckCircle2, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Caregiver Portal</h1>
            <p className="text-slate-500 mt-1">Monitoring patient adherence</p>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>
        <div className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <AddMedicationForm patientId={userId} />
        </div>
        <section className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-xl shadow-blue-100 text-white">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-xl font-bold">Monitor a New Patient</h2>
          </div>
          <form action={async (formData: FormData) => {
            'use server';
            const email = formData.get('email') as string;
            await linkPatient(userId, email);
          }} className="flex gap-3">
            <input 
              name="email" 
              type="email"
              className="flex-1 p-4 rounded-xl border-none text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-white/20 outline-none"
              placeholder="Enter patient's email address..."
              required
            />
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors">
              Link Patient
            </button>
          </form>
        </section>

        <div className="space-y-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Linked Patients
          </h2>
          
          {links?.map((link: any) => (
            <div key={link.patient_id} className="overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {link.profiles.full_name?.charAt(0) || 'P'}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{link.profiles.full_name}</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border px-3 py-1 rounded-full">
                  Live Syncing
                </span>
              </div>
              
              <div className="p-2">
                {link.profiles.medications?.map((med: any) => {
                  const takenTime = med.last_taken_at 
                     ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { 
                         hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' 
                       }) : null;

                  return (
                    <div key={med.id} className="flex justify-between items-center p-5 hover:bg-slate-50 rounded-2xl transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{med.name}</p>
                        <p className="text-xs text-slate-500 uppercase">{med.dosage} • {med.med_type}</p>
                        <div className="flex gap-3 mt-2">
                          <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Sched: {med.scheduled_time}</p>
                          {med.is_taken && (
                            <p className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Recorded: {takenTime}</p>
                          )}
                        </div>
                      </div>

                      <form action={async () => {
                        'use server';
                        await toggleMedication(med.id, med.is_taken);
                      }}>
                        <button 
                          type="submit"
                          className={`text-xs px-5 py-2.5 rounded-xl font-bold transition-all ${
                            med.is_taken 
                              ? 'bg-green-600 text-white shadow-inner' 
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {med.is_taken ? '✓ Verified' : 'Mark Taken'}
                        </button>
                      </form>
                    </div>
                  );
                })}
                {link.profiles.medications?.length === 0 && (
                  <p className="text-sm text-slate-400 italic p-6">No medications listed for this patient.</p>
                )}
              </div>
            </div>
          ))}
          
          {(!links || links.length === 0) && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">No patients linked to your account yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}